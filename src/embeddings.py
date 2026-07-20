from sentence_transformers import SentenceTransformer

class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer("BAAI/bge-m3")

    def encode(self,texts):
        return self.model.encode(texts)
    
    def encode_query(self,text):
        return self.model.encode(text)