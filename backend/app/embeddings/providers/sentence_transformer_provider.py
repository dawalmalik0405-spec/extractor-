from app.embeddings.base import (
    EmbeddingProvider
)


class SentenceTransformerProvider(
    EmbeddingProvider
):

    def __init__(
        self,
        model_name: str
    ):
        from sentence_transformers import SentenceTransformer

        self.model = (
            SentenceTransformer(
                model_name
            )
        )

    def embed_text(
        self,
        text: str
    ):
        return self.model.encode(
            text,
            normalize_embeddings=True,
        ).tolist()

    def embed_texts(
        self,
        texts: list[str]
    ):
        return self.model.encode(
            texts,
            normalize_embeddings=True,
        ).tolist()
