import cv2
from functools import lru_cache

from app.extractor.base import BaseExtractor

@lru_cache(maxsize=1)
def get_reader():
    import easyocr

    return easyocr.Reader(["en"])


def extract_text_from_image(image) -> str:
    if image is None:
        raise ValueError("The uploaded image could not be decoded")

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (3, 3), 0)
    _, threshold = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU,
    )
    result = get_reader().readtext(threshold, detail=0)
    return "\n".join(result).strip()


class ImageExtractor(BaseExtractor):

    def extract(self, file_path: str) -> str:

        image = cv2.imread(file_path)
        return extract_text_from_image(image)
