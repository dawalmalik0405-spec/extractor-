from pathlib import Path

from docx import Document


class DocxExtractor:
    def extract(self, file_path: Path) -> str:
        document = Document(file_path)
        paragraphs = [paragraph.text.strip() for paragraph in document.paragraphs if paragraph.text.strip()]
        return "\n".join(paragraphs)
