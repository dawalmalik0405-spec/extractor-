from paddleocr import PaddleOCR

from app.extractor.base import BaseExtractor


class ImageExtractor(BaseExtractor):

    def __init__(self):
        self.ocr = PaddleOCR(
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False,
            lang="en"
        )

    def extract(self, file_path: str) -> str:

        result = self.ocr.predict(file_path)

        texts = []

        for page in result:
            for box in page["rec_texts"]:
                texts.append(box)

        return "\n".join(texts)