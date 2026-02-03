import re
import nltk
from spellchecker import SpellChecker

spell = SpellChecker()


# STEP 1: BASIC CLEANING
def basic_clean(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\n+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()



# STEP 2: SPELL CORRECTION
def correct_spelling(text: str) -> str:
    corrected_words = []
    for word in text.split():
        if word.isalpha():
            corrected_words.append(spell.correction(word) or word)
        else:
            corrected_words.append(word)
    return " ".join(corrected_words)



# STEP 3: SENTENCE REBUILDING
def rebuild_sentences(text: str) -> str:
    sentences = nltk.sent_tokenize(text)
    return "\n".join(sentences)



# STEP 4: HEADING DETECTION
def detect_headings(text: str) -> str:
    lines = text.split("\n")
    formatted = []

    for line in lines:
        if "information storage" in line:
            formatted.append("\nINFORMATION STORAGE AND RETRIEVAL SYSTEM\n")
        elif line.startswith("definition") or "definition" in line:
            formatted.append("\nDEFINITION\n" + line)
        else:
            formatted.append(line)

    return "\n".join(formatted)



# FULL PIPELINE
def refine_text(raw_text: str) -> str:
    text = basic_clean(raw_text)
    text = correct_spelling(text)
    text = rebuild_sentences(text)
    text = detect_headings(text)
    return text
