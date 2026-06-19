from pathlib import Path
from tempfile import TemporaryDirectory

import fitz
from PIL import Image

from app.extractors.image_extractor import ImageExtractor


class ScannedPdfExtractor:
    def __init__(self) -> None:
        self.image_extractor = ImageExtractor()

    def extract(self, file_path: Path) -> str:
        parts: list[str] = []
        with TemporaryDirectory() as temp_dir:
            with fitz.open(file_path) as document:
                for index, page in enumerate(document):
                    pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                    image_path = Path(temp_dir) / f"page-{index + 1}.png"
                    Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples).save(image_path)
                    page_text = self.image_extractor.extract(image_path).strip()
                    if page_text:
                        parts.append(page_text)
        return "\n\n".join(parts)
