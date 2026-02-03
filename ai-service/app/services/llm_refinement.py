import os
import re
from typing import Optional

from dotenv import load_dotenv

# If you use OpenAI
from openai import OpenAI

load_dotenv()


# LLM CLIENT SETUP
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))



# SAFETY HELPERS

def keyword_coverage_check(input_text: str, output_text: str, threshold: float = 0.6) -> bool:
    """
    Ensure LLM output still contains most important keywords
    (prevents hallucination or content loss)
    """
    input_words = set(re.findall(r"\b[a-zA-Z]{4,}\b", input_text.lower()))
    output_words = set(re.findall(r"\b[a-zA-Z]{4,}\b", output_text.lower()))

    if not input_words:
        return True

    coverage = len(input_words & output_words) / len(input_words)
    return coverage >= threshold


def length_safety_check(input_text: str, output_text: str, max_ratio: float = 1.4) -> bool:
    """
    Prevent LLM from adding excessive new content
    """
    return len(output_text) <= len(input_text) * max_ratio



# PROMPT BUILDER

def build_prompt(cleaned_text: str) -> str:
    return f"""
You are an academic text editor.

Your task is to clean and restructure OCR-extracted academic text.

You MUST:
- Fix spelling mistakes
- Fix grammar
- Reconstruct broken sentences
- Organize content into headings and bullet points

You MUST NOT:
- Add new information
- Remove original meaning
- Introduce examples or explanations not present in the text

Do NOT summarize.
Do NOT invent content.

OCR TEXT:
\"\"\"
{cleaned_text}
\"\"\"
""".strip()



# MAIN LLM REFINEMENT FUNCTION

def refine_text_with_llm(
    cleaned_text: str,
    enable_llm: bool = True
) -> Optional[str]:
    """
    Refine OCR-cleaned text into student-readable notes using LLM.
    Falls back safely if LLM output is unsafe.
    """

    if not enable_llm or not cleaned_text.strip():
        return None

    prompt = build_prompt(cleaned_text)

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # fast + cost-efficient
            messages=[
                {"role": "system", "content": "You are a careful academic editor."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2  # LOW temperature = less hallucination
        )

        refined_text = response.choices[0].message.content.strip()

       
        # SAFETY VALIDATIONS

        if not length_safety_check(cleaned_text, refined_text):
            print("⚠️ LLM rejected: excessive expansion")
            return None

        if not keyword_coverage_check(cleaned_text, refined_text):
            print("⚠️ LLM rejected: keyword coverage too low")
            return None

        return refined_text

    except Exception as e:
        print("🔥 LLM refinement failed:", str(e))
        return None
