class Chunker:               
    def __init__(self, chunk_size, overlap, pages):
        self.chunk_size = chunk_size     
        self.overlap = overlap
        self.pages = pages

    def create_chunks(self):     
        chunks = []

        for page_data in self.pages:
            text = page_data["text"]
            page = page_data["page"]
            start = 0

            while start < len(text):
                end = start + self.chunk_size
                chunk_text = text[start:end]
                chunks.append({
                    "text":chunk_text,
                    "page":page
                })
                start += (self.chunk_size - self.overlap)
            
        return chunks