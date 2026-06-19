from pathlib import Path
from typing import Any

from paddleocr import PaddleOCR


class ImageExtractor:
    _ocr: PaddleOCR | None = None

    @classmethod
    def _get_ocr(cls) -> PaddleOCR:
        if cls._ocr is None:
            cls._ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
        return cls._ocr

    def extract(self, file_path: Path) -> str:
        result = self._get_ocr().ocr(str(file_path), cls=True)
        return self._result_to_text(result)

    @staticmethod
    def _result_to_text(result: Any) -> str:
        lines: list[str] = []
        for page in result or []:
            for item in page or []:
                if len(item) >= 2 and isinstance(item[1], (list, tuple)) and item[1]:
                    lines.append(str(item[1][0]))
        return "\n".join(lines)
