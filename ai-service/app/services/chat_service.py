from google import genai
import os

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

MODEL = "gemini-flash-latest"


def ask_gemini(context, question):

    prompt = f"""
You are an AI tutor.

Answer ONLY from the provided context.

If the answer is not present in the context, reply exactly:

"I couldn't find that information in your notes."

Context:
{context}

Question:
{question}
"""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )

        if hasattr(response, "text") and response.text:
            return response.text

        return "I couldn't generate a response."

    except Exception as e:
        print(f"Gemini Error: {e}")
        raise