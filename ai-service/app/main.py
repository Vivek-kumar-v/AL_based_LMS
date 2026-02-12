from fastapi import FastAPI
from app.api.ocr_routes import router as ocr_router
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI(
    title="LMS AI Service",
    description="OCR and NLP microservice for LMS",
    version="1.0.0"
)

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Root route (Render + browser friendly)
@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "LMS AI Service",
        "timestamp": datetime.utcnow().isoformat()
    }

# ✅ Health check route
@app.get("/health")
def health():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat()
    }

# ✅ OCR Router
app.include_router(ocr_router, prefix="/ocr", tags=["OCR"])