from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams
)
from qdrant_client.models import (
    PointStruct
)
import uuid


class QdrantService:

    COLLECTION_NAME = "documents"

    def __init__(self):

        self.client = QdrantClient(
            path="qdrant_data"
        )

    def create_collection(self):

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
                size=384,
                distance=Distance.COSINE
            )
        )



    def store_embedding(
        self,
        embedding,
        payload
    ):

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