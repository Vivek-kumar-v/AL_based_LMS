import os
import re
import time
import random
from typing import Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()


# CONFIGURATION

ENABLE_LLM = os.getenv("ENABLE_LLM", "true").lower() == "true"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize client
# We use 'v1alpha' because preview models often live there
client = None
if ENABLE_LLM and GEMINI_API_KEY:
    try:
        client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options={"api_version": "v1alpha"}
        )
    except Exception as e:
        print(f"⚠️ Error initializing Gemini Client: {e}")


# SAFETY HELPERS

def length_safety_check(input_text: str, output_text: str, max_ratio: float = 3.0) -> bool:
    """
    Checks if the output is suspiciously long compared to input.
    - input_text: The original OCR text.
    - output_text: The text returned by Gemini.
    - max_ratio: Allow output to be up to 3x longer (useful for bullet points/formatting).
    """
    return len(output_text) <= len(input_text) * max_ratio


def keyword_coverage_check(input_text: str, output_text: str, threshold: float = 0.4) -> bool:
    """
    Ensures the output isn't hallucinated nonsense by checking if 
    it contains at least 40% of the original unique big words.
    """
    input_words = set(re.findall(r"\b[a-zA-Z]{4,}\b", input_text.lower()))
    output_words = set(re.findall(r"\b[a-zA-Z]{4,}\b", output_text.lower()))

    if not input_words:
        return True

    return len(input_words & output_words) / len(input_words) >= threshold



# RESPONSE TEXT EXTRACTOR

def extract_text_from_response(response) -> Optional[str]:
    """
    Safely extracts text from the API response object.
    """
    try:
        if not response.candidates:
            print("⚠️ Gemini Debug: No candidates returned.")
            return None

        candidate = response.candidates[0]
        
        # Log unexpected finish reasons
        if candidate.finish_reason != "STOP":
            print(f"⚠️ Gemini stopped due to reason: {candidate.finish_reason}")
            # If max tokens hit, we usually still want the partial text
            if candidate.finish_reason != "MAX_TOKENS": 
                return None

        if not candidate.content or not candidate.content.parts:
            print("⚠️ Gemini Debug: Candidate has zero content parts.")
            return None

        text_parts = []
        for part in candidate.content.parts:
            if hasattr(part, "text") and part.text:
                text_parts.append(part.text)
        
        extracted_text = "".join(text_parts).strip()
        
        if not extracted_text:
            return None
            
        return extracted_text

    except Exception as e:
        print(f"🔥 Extraction Logic Error: {str(e)}")
        return None



# PROMPT BUILDER

def build_prompt(cleaned_text: str) -> str:
    return f"""
You are an academic text editor.

Your task is to clean and restructure the OCR-extracted academic text below.

You MUST:
- Fix spelling mistakes
- Fix grammar
- Reconstruct broken sentences
- Organize content into headings and bullet points for readability

You MUST NOT:
- Add new information
- Remove original meaning
- Introduce explanations or examples

Do NOT summarize.
Do NOT invent content.

OCR TEXT:
\"\"\"
{cleaned_text}
\"\"\"
""".strip()



# MAIN REFINEMENT FUNCTION


# MAIN REFINEMENT FUNCTION (WITH SUCCESS LOGS)

def refine_text_with_gemini(cleaned_text: str) -> Optional[str]:
    """
    Refines text using 'gemini-2.5-flash-preview-09-2025'.
    - Includes SUCCESS LOGGING to verify output.
    - Handles Input Truncation & Retries.
    """

    if not ENABLE_LLM:
        print("ℹ️ Gemini LLM disabled via configuration")
        return None

    if not client:
        print("⚠️ Gemini client not initialized")
        return None

    if not cleaned_text.strip():
        return None

    # 1. INPUT TRUNCATION
    SAFE_CHAR_LIMIT = 25000 
    if len(cleaned_text) > SAFE_CHAR_LIMIT:
        print(f"⚠️ Input too long ({len(cleaned_text)} chars). Truncating to {SAFE_CHAR_LIMIT}...")
        cleaned_text = cleaned_text[:SAFE_CHAR_LIMIT] + "... [TRUNCATED]"

    # Safety settings
    safety_settings = [
        types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_NONE"),
        types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_NONE"),
        types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_NONE"),
        types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_NONE"),
    ]

    MAX_RETRIES = 5
    
    for attempt in range(MAX_RETRIES):
        try:
            print(f"🔄 Sending request to Gemini (Attempt {attempt+1}/{MAX_RETRIES})...")
            
            start_time = time.time()
            response = client.models.generate_content(
                model="gemini-2.5-flash-preview-09-2025",
                contents=[
                    types.Content(
                        role="user",
                        parts=[types.Part(text=build_prompt(cleaned_text))]
                    )
                ],
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    max_output_tokens=8192,
                    safety_settings=safety_settings,
                ),
            )
            elapsed = time.time() - start_time

            refined_text = extract_text_from_response(response)

            if not refined_text:
                print("⚠️ Received empty response from Gemini.")
                return None

       
            # OUTPUT SAFETY VALIDATIONS

            # Check 1: Length Ratio (Relaxed to 3.0)
            if not length_safety_check(cleaned_text, refined_text, max_ratio=3.0):
                print("⚠️ Output rejected: Excessive expansion.")
                print(f"   Input Length: {len(cleaned_text)} -> Output Length: {len(refined_text)}")
                return None

            # Check 2: Keyword Coverage
            if not keyword_coverage_check(cleaned_text, refined_text):
                print("⚠️ Output rejected: Keyword coverage too low (potential hallucination).")
                return None

    
            # SUCCESS LOGGING
            print(f"✅ Gemini Refinement Successful! (Time: {elapsed:.2f}s)")
            print(f"   Input Length: {len(cleaned_text)} chars")
            print(f"   Output Length: {len(refined_text)} chars")
            print(f"   Preview: {refined_text[:100].replace(chr(10), ' ')}...") # Print first 100 chars
            
            return refined_text

        except Exception as e:
            error_str = str(e)
            
            # Handle Rate Limits
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "503" in error_str:
                sleep_time = (2 ** attempt) + 2
                print(f"⏳ Quota exceeded. Waiting {sleep_time}s...")
                time.sleep(sleep_time)
            
            # Handle Not Found
            elif "404" in error_str and "NOT_FOUND" in error_str:
                print(f"❌ Model 'gemini-2.5-flash-preview-09-2025' not found.")
                return None
            
            else:
                print(f"🔥 Gemini fatal error: {error_str}")
                return None

    print("❌ Max retries reached. Skipping LLM refinement.")
    return None