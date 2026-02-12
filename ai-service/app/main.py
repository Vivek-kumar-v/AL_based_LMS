from fastapi import FastAPI
from app.api.ocr_routes import router as ocr_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="LMS AI Service",
    description="OCR and NLP microservice for LMS",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ocr_router, prefix="/ocr", tags=["OCR"])
