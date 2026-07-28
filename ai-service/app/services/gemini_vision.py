import os
from typing import Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# ==========================
# CONFIGURATION
# ==========================

ENABLE_LLM = os.getenv("ENABLE_LLM", "true").lower() == "true"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = None

if ENABLE_LLM and GEMINI_API_KEY:
    try:
        client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options={"api_version": "v1alpha"}
        )
    except Exception as e:
        print(f"⚠️ Error initializing Gemini Vision Client: {e}")


# ==========================
# OCR PROMPT
# ==========================

PROMPT = """
You are an OCR and document understanding assistant.

Extract ALL visible text from the provided document image.

Rules:
- Preserve headings.
- Preserve paragraphs.
- Preserve numbered lists.
- Preserve bullet points.
- Preserve tables in readable text format.
- Preserve formulas.
- Preserve code blocks.
- Merge words broken across multiple lines.
- Ignore standalone page numbers.
- Ignore watermarks.
- Ignore blank margins.
- Do NOT summarize.
- Do NOT explain.
- Do NOT add new information.
- Return ONLY the extracted text.
""".strip()


# ==========================
# RESPONSE PARSER
# ==========================

def extract_text_from_response(response) -> Optional[str]:

    try:

        if not response.candidates:
            print("⚠️ No candidates returned.")
            return None

        candidate = response.candidates[0]

        if not candidate.content:
            return None

        if not candidate.content.parts:
            return None

        text_parts = []

        for part in candidate.content.parts:

            if hasattr(part, "text") and part.text:
                text_parts.append(part.text)

        extracted = "".join(text_parts).strip()

        return extracted if extracted else None

    except Exception as e:

        print(f"🔥 Response Parsing Error: {e}")

        return None


# ==========================
# MAIN OCR FUNCTION
# ==========================

def extract_text_from_image(image_bytes: bytes) -> str:

    if not ENABLE_LLM:
        raise RuntimeError("Gemini Vision is disabled.")

    if client is None:
        raise RuntimeError("Gemini Vision client not initialized.")

    try:

        response = client.models.generate_content(

            model="gemini-3.6-flash",

            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part(text=PROMPT),
                        types.Part.from_bytes(
                            data=image_bytes,
                            mime_type="image/png"
                        )
                    ]
                )
            ],

            config=types.GenerateContentConfig(
                temperature=0.0,
                max_output_tokens=8192,
            ),
        )

        extracted_text = extract_text_from_response(response)

        if extracted_text:

            print("✅ Gemini Vision OCR Successful")

            return extracted_text

        print("⚠️ Gemini Vision returned empty text.")

        return ""

    except Exception as e:

        print(f"🔥 Gemini Vision Error: {e}")

        return ""