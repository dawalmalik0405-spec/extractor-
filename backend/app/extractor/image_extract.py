import cv2
import easyocr

from app.extractor.base import BaseExtractor

reader = easyocr.Reader(['en'])


class ImageExtractor(BaseExtractor):

    def extract(self, file_path: str) -> str:

        image = cv2.imread(file_path)

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )

        gray = cv2.GaussianBlur(
            gray,
            (3, 3),
            0
        )

        _, thresh = cv2.threshold(
            gray,
            0,
            255,
            cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )


        result = reader.readtext(
            thresh,
            detail=0
        )

        return "\n".join(result)