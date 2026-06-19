from functools import cached_property

from sentence_transformers import SentenceTransformer


class EmbeddingService:
    def __init__(self, model_name: str) -> None:
        self.model_name = model_name

    @cached_property
    def model(self) -> SentenceTransformer:
        return SentenceTransformer(self.model_name)

    def generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        embeddings = self.model.encode(texts, normalize_embeddings=True)
        return [embedding.astype(float).tolist() for embedding in embeddings]
