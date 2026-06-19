import fitz

from app.extractor.base import BaseExtractor


class PDFExtractor(BaseExtractor):

    def extract(self, file_path: str) -> str:

        text = ""

        pdf = fitz.open(file_path)

        for page in pdf:
            text += page.get_text()

        return text