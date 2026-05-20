FROM python:3.12-slim

# Install system dependencies:
# - tesseract-ocr      -> OCR engine for pytesseract
# - poppler-utils      -> Required by pdf2image (provides pdfinfo and pdftoppm)
# - libgl1             -> Required by OpenCV
# - libglib2.0-0       -> Required by OpenCV
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy language model
RUN python -m spacy download en_core_web_sm

# Download required NLTK datasets
RUN python -c "import nltk; \
nltk.download('punkt'); \
nltk.download('punkt_tab'); \
nltk.download('stopwords')"

# Copy application source code
COPY . .

# Expose application port
EXPOSE 8000

# Start FastAPI application
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"