from abc import ABC, abstractmethod


class EmbeddingProvider(ABC):

    @abstractmethod
    def embed_text(self, text: str):
        pass

    @abstractmethod
    def embed_texts(self, texts: list[str]):
        pass