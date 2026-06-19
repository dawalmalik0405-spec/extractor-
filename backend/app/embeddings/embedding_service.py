from app.config.settings import (
    EMBEDDING_MODEL
)

from app.embeddings.providers.sentence_transformer_provider import (
    SentenceTransformerProvider
)

from functools import lru_cache


class EmbeddingService:

    def __init__(self):

        self.provider = (
            SentenceTransformerProvider(
                EMBEDDING_MODEL
            )
        )

    def generate_embedding(
        self,
        text: str
    ):
        return self.provider.embed_text(
            text
        )

    def generate_embeddings(
        self,
        texts: list[str]
    ):
        return self.provider.embed_texts(
            texts
        )


@lru_cache(maxsize=1)
def get_embedding_service():
    return EmbeddingService()
    


# def main():
    

#     service = EmbeddingService()

#     embedding = service.generate_embedding(
#         "Hello world"
#     )

#     print(type(embedding))
#     print(len(embedding))
#     print(embedding)

    
# if __name__ == "__main__":
    
#     main()
