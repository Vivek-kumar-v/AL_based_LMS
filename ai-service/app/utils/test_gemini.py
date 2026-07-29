from google import genai
from dotenv import load_dotenv
from pathlib import Path
import os

# Go up from app/utils -> app -> ai-service
env_path = Path(__file__).resolve().parents[2] / ".env"

print("Loading:", env_path)

load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GEMINI_API_KEY")
print("API Key:", api_key)

client = genai.Client(api_key=api_key)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Hello"
)

print(response.text)