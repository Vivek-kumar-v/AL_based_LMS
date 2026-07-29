from pydantic import BaseModel
from typing import List


class OCRRequest(BaseModel):
    fileUrl: str
    fileType: str


class Chunk(BaseModel):
    chunkIndex: int
    text: str
    embedding: List[float]


class OCRResponse(BaseModel):
    rawText: str
    cleanedText: str
    llmText: str
    chunks: List[Chunk]
    concepts: List[str]