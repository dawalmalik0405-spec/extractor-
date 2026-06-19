from pathlib import Path

from app.extractors.base import DocumentExtractor
from app.extractors.docx_extractor import DocxExtractor
from app.extractors.image_extractor import ImageExtractor
from app.extractors.pdf_extractor import PdfExtractor
from app.extractors.scanned_pdf_extractor import ScannedPdfExtractor


class PdfWithOcrFallbackExtractor:
    def __init__(self) -> None:
        self.pdf_extractor = PdfExtractor()
        self.scanned_pdf_extractor = ScannedPdfExtractor()

    def extract(self, file_path: Path) -> str:
        text = self.pdf_extractor.extract(file_path)
        if text.strip():
            return text
        return self.scanned_pdf_extractor.extract(file_path)


class ExtractorFactory:
    _extractors: dict[str, DocumentExtractor] = {
        "pdf": PdfWithOcrFallbackExtractor(),
        "docx": DocxExtractor(),
        "png": ImageExtractor(),
        "jpg": ImageExtractor(),
        "jpeg": ImageExtractor(),
    }

    @classmethod
    def get_extractor(cls, file_type: str) -> DocumentExtractor:
        normalized = file_type.lower().lstrip(".")
        if normalized not in cls._extractors:
            raise ValueError(f"Unsupported file type: {file_type}")
        return cls._extractors[normalized]
