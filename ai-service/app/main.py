from fastapi import FastAPI
from app.api.ocr_routes import router as ocr_router

app = FastAPI(
    title="LMS AI Service",
    description="OCR and NLP microservice for LMS",
    version="1.0.0"
)

app.include_router(ocr_router, prefix="/ocr", tags=["OCR"])
