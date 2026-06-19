import fitz
import cv2
import logging
import numpy as np

from app.extractor.base import BaseExtractor
from app.extractor.image_extract import extract_text_from_image


logger = logging.getLogger(__name__)


class PDFExtractor(BaseExtractor):

    def extract(self, file_path: str) -> str:
        with fitz.open(file_path) as pdf:
            pages = []
            for page_number, page in enumerate(pdf, start=1):
                text = page.get_text().strip()
                if not text:
                    logger.info("Running OCR for PDF page %d of %d", page_number, len(pdf))
                    pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                    image = cv2.imdecode(
                        np.frombuffer(pixmap.tobytes("png"), dtype=np.uint8),
                        cv2.IMREAD_COLOR,
                    )
                    text = extract_text_from_image(image)
                if text:
                    pages.append(text)
            return "\n\n".join(pages).strip()
