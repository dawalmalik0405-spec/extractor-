from langchain_text_splitters import (
    RecursiveCharacterTextSplitter
)


class TextChunker:

    def chunk(
        self,
        text: str
    ):

        if not text or not text.strip():
            return []

        splitter = (
            RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
        )

        return splitter.split_text(text.strip())
    
