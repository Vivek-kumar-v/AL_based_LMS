from typing import List


def chunk_text(text: str,
               chunk_size: int = 500,
               overlap: int = 100) -> List[str]:

    words = text.split()

    if len(words) <= chunk_size:
        return [text]

    chunks = []

    start = 0

    while start < len(words):

        end = min(start + chunk_size, len(words))

        chunks.append(" ".join(words[start:end]))

        if end == len(words):
            break

        start = end - overlap

    return chunks