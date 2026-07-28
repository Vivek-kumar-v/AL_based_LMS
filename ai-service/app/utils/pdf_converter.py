from pdf2image import convert_from_bytes
from io import BytesIO


def pdf_to_images(pdf_bytes: bytes):

    pages = convert_from_bytes(
        pdf_bytes,
        dpi=300
    )

    images = []

    for page in pages:

        buffer = BytesIO()

        page.save(buffer, format="PNG")

        buffer.seek(0)

        images.append(buffer.read())

    return images