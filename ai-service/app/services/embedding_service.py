from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

MODEL = "gemini-embedding-001"


def generate_embedding(text: str):
    """
    Generate embedding for a piece of text.
    Returns a list of floats.
    """

    if not text.strip():
        return []

    response = client.models.embed_content(
        model=MODEL,
        contents=text
    )

    return response.embeddings[0].values