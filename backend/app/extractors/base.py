from pathlib import Path
from typing import Protocol


class DocumentExtractor(Protocol):
    def extract(self, file_path: Path) -> str:
        ...
