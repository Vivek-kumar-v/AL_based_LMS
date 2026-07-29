from fastapi import APIRouter
from pydantic import BaseModel

from app.services.embedding_service import generate_embedding

router = APIRouter()

class EmbedRequest(BaseModel):
    text: str

class EmbedResponse(BaseModel):
    embedding: list[float]

@router.post("/", response_model=EmbedResponse)
def create_embedding(payload: EmbedRequest):
    embedding = generate_embedding(payload.text)
    return {
        "embedding": embedding
    }