import requests
import pytesseract
from PIL import Image
from io import BytesIO
from pdf2image import convert_from_bytes

from app.utils.image_preprocessing import preprocess_image_for_ocr
from app.services.text_refinement import refine_text
from app.services.gemini_refinement import refine_text_with_gemini
from app.services.concept_extraction import extract_concepts
from app.models.schemas import OCRRequest
import shutil
import pytesseract



# ✅ Tesseract path setup
pytesseract.pytesseract.tesseract_cmd = shutil.which("tesseract")


# IMAGE OCR
def extract_text_from_image(image_bytes: bytes) -> str:
    processed_img = preprocess_image_for_ocr(image_bytes)

    text = pytesseract.image_to_string(
        processed_img,
        config="--oem 3 --psm 6"
    )

    return text



# PDF OCR (SCANNED PDF SUPPORT)
def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    pages = convert_from_bytes(pdf_bytes, dpi=300)

    full_text = []

    for i, page in enumerate(pages):
        # Convert PIL -> bytes
        buf = BytesIO()
        page.save(buf, format="PNG")
        img_bytes = buf.getvalue()

        # Preprocess + OCR
        page_text = extract_text_from_image(img_bytes)

        full_text.append(f"\n\n--- Page {i+1} ---\n{page_text}")

    return "\n".join(full_text)



# MAIN OCR PIPELINE
def process_document_ocr(payload: OCRRequest):

    response = requests.get(payload.fileUrl, timeout=60)
    response.raise_for_status()

    raw_text = ""

    # ✅ PDF OCR
    if payload.fileType == "pdf":
        raw_text = extract_text_from_pdf(response.content)

    # ✅ IMAGE OCR
    elif payload.fileType == "image":
        raw_text = extract_text_from_image(response.content)

    else:
        raise ValueError("Unsupported fileType. Use pdf or image.")

    # 1) Clean / refine
    cleaned_text = refine_text(raw_text)

    # 2) Gemini Refinement (optional)
    llmText = refine_text_with_gemini(cleaned_text)

    # if not llmText:
    #     llmText = cleaned_text

    # 3) Concept extraction
    concepts = extract_concepts(llmText)

    return {
        "rawText": raw_text,
        "cleanedText": cleaned_text,
        "llmText": llmText,
        "concepts": concepts
    }
