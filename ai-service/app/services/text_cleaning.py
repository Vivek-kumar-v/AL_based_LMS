import re

def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^A-Za-z0-9.,()\- ]", "", text)
    return text.strip()
