from pathlib import Path

import fitz


class PdfExtractor:
    def extract(self, file_path: Path) -> str:
        parts: list[str] = []
        with fitz.open(file_path) as document:
            for page in document:
                text = page.get_text("text").strip()
                if text:
                    parts.append(text)
        return "\n\n".join(parts)
