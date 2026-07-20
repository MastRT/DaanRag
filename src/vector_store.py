from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct
)


class VectorStore:

    def __init__(self):
        self.client = QdrantClient(
            path="./qdrant_db"
        )

        self.collection_name = "documents"

        self._create_collection()

    def _create_collection(self):

        if not self.client.collection_exists(
            self.collection_name
        ):

            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=1024,
                    distance=Distance.COSINE
                )
            )

    def add_documents(
        self,
        chunks,
        embeddings,
        filename
    ):

        points = []

        for i, (chunk, embedding) in enumerate(
            zip(chunks, embeddings)
        ):

            points.append(
                PointStruct(
                    id=i,
                    vector=embedding.tolist(),
                    payload={
                        "text": chunk["text"],
                        "page": chunk["page"],
                        "chunk_id": f"{filename}_{i}",
                        "filename": filename
                        }
                )
            )

        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )

    def search(
        self,
        query_embedding,
        limit=3
    ):

        results = self.client.query_points(
            collection_name=self.collection_name,
            query=query_embedding.tolist(),
            limit=limit
        )

        return results.points