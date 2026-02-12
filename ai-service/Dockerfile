FROM python:3.12-slim

# Install system dependencies (Tesseract + OpenCV required libs)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install python dependencies first (better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Download NLTK tokenizer datasets
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab')"

# Copy rest of the project
COPY . .

# Expose port for Render
EXPOSE 8000

# Start FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]