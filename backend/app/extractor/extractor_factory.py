from app.extractor.pdf_extractor import PDFExtractor
from app.extractor.docx_extract import DOCXExtractor
from app.extractor.image_extract import ImageExtractor


class ExtractorFactory:

    @staticmethod
    def get_extractor(
        file_type: str
    ):

        if file_type == ".pdf":
            return PDFExtractor()

        if file_type == ".docx":
            return DOCXExtractor()

        if file_type in {
            ".png",
            ".jpg",
            ".jpeg"
        }:
            return ImageExtractor()

        raise ValueError(
            f"Unsupported file type: {file_type}"
        )
    

