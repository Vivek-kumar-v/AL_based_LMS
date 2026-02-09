import re
import spacy
from collections import Counter

nlp = spacy.load("en_core_web_sm")


STOP_CONCEPTS = {
    "introduction",
    "example",
    "flow",
    "system goal",
    "notes",
    "unit test",
    "case",
    "definition",
    "summary",
    "overview",
    "earlier",
    "now",
}


def clean_text(text: str) -> str:
    # remove table pipes & markdown separators
    text = re.sub(r"\|", " ", text)
    text = re.sub(r":?-{2,}:?", " ", text)

    # normalize spaces
    text = re.sub(r"\s+", " ", text).strip()
    return text


def is_valid_concept(phrase: str) -> bool:
    phrase = phrase.strip()

    if not re.search(r"[a-zA-Z]", phrase):
        return False

    if len(phrase) < 4 or len(phrase) > 50:
        return False

    # remove garbage symbols
    if re.search(r"[\\_/{}()\[\]]", phrase):
        return False

    # remove mostly numbers
    if re.fullmatch(r"[0-9\s\-]+", phrase):
        return False

    # remove stop concepts
    if phrase.lower() in STOP_CONCEPTS:
        return False

    # avoid single-word weak concepts
    words = phrase.split()
    if len(words) == 1 and len(words[0]) < 6:
        return False

    return True


def add_concept(concepts, seen, phrase):
    phrase = phrase.strip()

    # remove markdown symbols
    phrase = re.sub(r"[*_`]+", "", phrase).strip()

    # remove numbering like "1. HR Planning"
    phrase = re.sub(r"^\d+[\.\)]\s*", "", phrase)

    # remove colon at end
    phrase = re.sub(r":$", "", phrase).strip()

    # remove extra symbols
    phrase = re.sub(r"[^a-zA-Z0-9\s\-]", "", phrase).strip()

    if not is_valid_concept(phrase):
        return

    key = phrase.lower()
    if key not in seen:
        seen.add(key)
        concepts.append(phrase)


def extract_concepts(text: str, top_n: int = 15) -> list:
    """
    Works best with llmText, but also works with cleanedText.
    Returns only a few meaningful concepts.
    """

    text = clean_text(text)

    concepts = []
    seen = set()

    # ✅ 1) Markdown headings
    heading_matches = re.findall(r"^\s{0,3}#{1,4}\s+(.+)$", text, flags=re.MULTILINE)
    for h in heading_matches:
        add_concept(concepts, seen, h)

    # ✅ 2) Bold concepts
    bold_matches = re.findall(r"\*\*(.+?)\*\*", text)
    for b in bold_matches:
        add_concept(concepts, seen, b)

    # ✅ 3) Bullet titles
    bullet_matches = re.findall(r"^\s*[-•→]+\s*(.+)$", text, flags=re.MULTILINE)
    for line in bullet_matches:
        # take only short bullet phrases (concept-like)
        if len(line) <= 60:
            add_concept(concepts, seen, line)

    # ✅ 4) Lines ending with ":" (often headings in notes)
    colon_matches = re.findall(r"([A-Za-z][A-Za-z0-9\s\-]{3,50})\s*:", text)
    for c in colon_matches:
        add_concept(concepts, seen, c)

    # If already enough, return
    if len(concepts) >= top_n:
        return concepts[:top_n]

    # ✅ 5) Fallback: spaCy noun chunks (highly filtered)
    doc = nlp(text)
    counter = Counter()

    for chunk in doc.noun_chunks:
        phrase = chunk.text.strip()

        if all(tok.is_stop for tok in chunk):
            continue

        phrase_clean = re.sub(r"[^a-zA-Z0-9\s\-]", "", phrase).strip()

        if is_valid_concept(phrase_clean):
            lemma_phrase = " ".join(
                [t.lemma_.lower() for t in chunk if not t.is_stop]
            ).strip()

            if len(lemma_phrase) >= 4 and lemma_phrase not in STOP_CONCEPTS:
                counter[lemma_phrase] += 1

    for concept, _ in counter.most_common(top_n * 2):
        display = " ".join([w.capitalize() for w in concept.split()])
        add_concept(concepts, seen, display)

        if len(concepts) >= top_n:
            break

    return concepts[:top_n]
