from docx import Document

from app.extractor.base import BaseExtractor


class DOCXExtractor(BaseExtractor):

    def extract(self, file_path: str) -> str:

        doc = Document(file_path)

        return "\n".join(
            para.text
            for para in doc.paragraphs
            if para.text.strip()
        ).strip()
