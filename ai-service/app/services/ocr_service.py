import requests
import pytesseract
import pdfplumber
from PIL import Image
from io import BytesIO

from app.services.text_cleaning import clean_text
from app.services.gemini_refinement import refine_text_with_gemini
from app.services.llm_refinement import refine_text_with_llm
from app.services.text_refinement import refine_text
from app.services.concept_extraction import extract_concepts
from app.models.schemas import OCRRequest
from app.core.config import TESSERACT_PATH

if TESSERACT_PATH:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text


def extract_text_from_image(file_bytes: bytes) -> str:
    image = Image.open(BytesIO(file_bytes))
    return pytesseract.image_to_string(image)


def process_document_ocr(payload: OCRRequest):
    response = requests.get(payload.fileUrl)
    response.raise_for_status()

    raw_text = ""

    if payload.fileType == "pdf":
        raw_text = extract_text_from_pdf(response.content)
    else:
        raw_text = extract_text_from_image(response.content)

    # cleaned_text = clean_text(raw_text)
     # cleaned_text = refine_text(raw_text)
    cleaned_text = refine_text(raw_text)

    llmText = refine_text_with_gemini(cleaned_text)
    
    if llmText is None:
        llmText = cleaned_text 
    
    # fallback if LLM fails
    # llmText = llmText or cleaned_text

    concepts = extract_concepts(cleaned_text)
    

    return {
    "rawText": raw_text,
    "cleanedText": cleaned_text,
    "llmText": llmText,
    "concepts": concepts

    }
