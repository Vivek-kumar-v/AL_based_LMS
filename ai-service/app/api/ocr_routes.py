from fastapi import APIRouter
from app.models.schemas import OCRRequest, OCRResponse
from app.services.ocr_service import process_document_ocr

router = APIRouter()

@router.post("/", response_model=OCRResponse)
def run_ocr(payload: OCRRequest):
    return process_document_ocr(payload)
