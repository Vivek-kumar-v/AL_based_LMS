import requests

from app.models.schemas import OCRRequest

from app.utils.pdf_converter import pdf_to_images
from app.services.gemini_vision import extract_text_from_image

from app.services.text_refinement import refine_text
from app.services.concept_extraction import extract_concepts


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Convert PDF pages into images and extract text
    using Gemini Vision.
    """

    images = pdf_to_images(pdf_bytes)

    pages = []

    for i, image_bytes in enumerate(images):

        page_text = extract_text_from_image(image_bytes)

        pages.append(
            f"\n\n--- Page {i + 1} ---\n{page_text}"
        )

    return "\n".join(pages)


def process_document_ocr(payload: OCRRequest):
    """
    Complete AI Document Processing Pipeline

    Supports:
    - PDF
    - Image

    Pipeline:

    Cloudinary
        ↓
    Download File
        ↓
    Gemini Vision
        ↓
    Text Cleaning
        ↓
    Concept Extraction
        ↓
    Return Results
    """

    response = requests.get(
        payload.fileUrl,
        timeout=60
    )

    response.raise_for_status()

    if payload.fileType.lower() == "pdf":

        raw_text = extract_text_from_pdf(
            response.content
        )

    elif payload.fileType.lower() == "image":

        raw_text = extract_text_from_image(
            response.content
        )

    else:
        raise ValueError(
            "Unsupported file type. Supported types: PDF, Image"
        )

    cleaned_text = refine_text(raw_text)

    concepts = extract_concepts(cleaned_text)

    return {

        "rawText": raw_text,

        "cleanedText": cleaned_text,

        "llmText": cleaned_text,

        "concepts": concepts

    }