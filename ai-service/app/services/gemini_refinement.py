import os
import re
from typing import Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# CONFIGURATION

ENABLE_LLM = os.getenv("ENABLE_LLM", "true").lower() == "true"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize client
client = None
if ENABLE_LLM and GEMINI_API_KEY:
    client = genai.Client(
        api_key=GEMINI_API_KEY,
        http_options={'api_version': 'v1alpha'}
    )


# SAFETY HELPERS

def length_safety_check(input_text: str, output_text: str, max_ratio: float = 1.4) -> bool:
    """Check if output length doesn't exceed input by more than max_ratio."""
    return len(output_text) <= len(input_text) * max_ratio


def keyword_coverage_check(input_text: str, output_text: str, threshold: float = 0.6) -> bool:
    """Check if output retains at least threshold proportion of input keywords."""
    input_words = set(re.findall(r"\b[a-zA-Z]{4,}\b", input_text.lower()))
    output_words = set(re.findall(r"\b[a-zA-Z]{4,}\b", output_text.lower()))

    if not input_words:
        return True

    return len(input_words & output_words) / len(input_words) >= threshold


# PROMPT BUILDER

def build_prompt(cleaned_text: str) -> str:
    """Build the refinement prompt for Gemini."""
    return f"""You are an academic text editor.

Your task is to clean and restructure OCR-extracted academic text.

You MUST:
- Fix spelling mistakes
- Fix grammar
- Reconstruct broken sentences
- Organize content into headings and bullet points

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

def refine_text_with_gemini(cleaned_text: str) -> Optional[str]:
    """
    Uses Gemini to refine OCR-cleaned text.
    Returns None if LLM is disabled or output is unsafe.
    """

    if not ENABLE_LLM:
        print("ℹ️ Gemini LLM disabled via configuration")
        return None

    if not client:
        print("⚠️ Gemini client not initialized (check API key)")
        return None

    if not cleaned_text.strip():
        return None

    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=build_prompt(cleaned_text),
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=1500,
            )
        )

        refined_text = response.text.strip()

        # SAFETY VALIDATIONS

        if not length_safety_check(cleaned_text, refined_text):
            print("⚠️ Gemini output rejected: excessive expansion")
            return None

        if not keyword_coverage_check(cleaned_text, refined_text):
            print("⚠️ Gemini output rejected: keyword coverage too low")
            return None

        return refined_text

    except Exception as e:
        print(f"🔥 Gemini refinement failed: {str(e)}")
        return None