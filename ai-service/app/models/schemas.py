from pydantic import BaseModel

class OCRRequest(BaseModel):
    fileUrl: str
    fileType: str  # "pdf" or "image"

class OCRResponse(BaseModel):
    rawText: str
    cleanedText: str
    llmText: str
    concepts: list[str]
