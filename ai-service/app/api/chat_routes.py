from fastapi import APIRouter
from pydantic import BaseModel

from app.services.chat_service import ask_gemini

router = APIRouter()


class ChatRequest(BaseModel):
    context: str
    question: str


@router.post("/")
def chat(payload: ChatRequest):

    answer = ask_gemini(
        payload.context,
        payload.question
    )

    return {
        "answer": answer
    }