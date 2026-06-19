from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams
)
from qdrant_client.models import (
    PointStruct
)
from qdrant_client.models import PointIdsList
from functools import lru_cache
import uuid

from app.config.settings import QDRANT_PATH


class QdrantService:

    COLLECTION_NAME = "documents"

    def __init__(self):

        self.client = QdrantClient(
            path=str(QDRANT_PATH)
        )

    def create_collection(self, vector_size: int):

        collections = (
            self.client.get_collections()
        )

        existing = [
            collection.name
            for collection in collections.collections
        ]

        if self.COLLECTION_NAME in existing:
            return

        self.client.create_collection(
            collection_name=self.COLLECTION_NAME,
            vectors_config=VectorParams(
                size=vector_size,
                distance=Distance.COSINE
            )
        )



    def store_embedding(
        self,
        embedding,
        payload
    ):

        self.create_collection(len(embedding))

        point_id = str(uuid.uuid4())

        self.client.upsert(
            collection_name=self.COLLECTION_NAME,
            points=[
                PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload=payload
                )
            ]
        )

        return point_id


    def delete_vector(
        self,
        vector_id: str
    ):

        self.client.delete(
            collection_name=self.COLLECTION_NAME,
            points_selector=PointIdsList(
                points=[vector_id]
            )
        )

    def delete_vectors(self, vector_ids: list[str]):
        if not vector_ids:
            return

        self.client.delete(
            collection_name=self.COLLECTION_NAME,
            points_selector=PointIdsList(points=vector_ids),
        )


@lru_cache(maxsize=1)
def get_qdrant_service():
    return QdrantService()



# def main():
#     from app.embeddings.embedding_service import (
#       EmbeddingService
#       )

#     qdrant = QdrantService()

#     qdrant.create_collection()

#     print(
#         qdrant.client.get_collections()
#     )

#     embedding_service = EmbeddingService()

#     vector = embedding_service.generate_embedding(
#         "Hello world"
#     )

#     vector_id = qdrant.store_embedding(
#         embedding=vector,
#         payload={
#             "text": "Hello world"
#         }
#     )

#     print(vector_id)


# if __name__ == "__main__":
#     main()
