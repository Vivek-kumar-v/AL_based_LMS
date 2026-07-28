import re

def clean_text(text: str) -> str:
    if not text:
        return ""

    # Convert escaped newlines to actual newlines
    text = text.replace("\\n", "\n")

    # Replace HTML line breaks
    text = text.replace("<br>", "\n")

    # Replace bullet symbol
    text = text.replace("•", "- ")

    # Remove Markdown bold
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)

    # Remove Markdown headings (#, ##, ###)
    text = re.sub(r"^#+\s*", "", text, flags=re.MULTILINE)

    # Remove unwanted characters but preserve useful punctuation
    text = re.sub(r"[^A-Za-z0-9.,:;!?()\-/\n ]", "", text)

    # Remove extra spaces
    text = re.sub(r"[ \t]+", " ", text)

    # Remove excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()






# import re

# def clean_text(text: str) -> str:
#     text = re.sub(r"\s+", " ", text)
#     text = re.sub(r"[^A-Za-z0-9.,()\- ]", "", text)
#     return text.strip()
