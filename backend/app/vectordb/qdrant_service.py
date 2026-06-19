from uuid import UUID

from qdrant_client import QdrantClient
from qdrant_client.http import models


class QdrantService:
    def __init__(self, url: str, collection_name: str, vector_size: int = 384) -> None:
        self.client = QdrantClient(url=url)
        self.collection_name = collection_name
        self.vector_size = vector_size

    def ensure_collection(self) -> None:
        collections = self.client.get_collections().collections
        if any(collection.name == self.collection_name for collection in collections):
            return
        self.client.create_collection(
            collection_name=self.collection_name,
            vectors_config=models.VectorParams(size=self.vector_size, distance=models.Distance.COSINE),
        )

    def upsert_chunks(self, points: list[models.PointStruct]) -> None:
        if points:
            self.client.upsert(collection_name=self.collection_name, points=points)

    def delete_document_vectors(self, document_id: UUID) -> None:
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=models.FilterSelector(
                filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="document_id",
                            match=models.MatchValue(value=str(document_id)),
                        )
                    ]
                )
            ),
        )
