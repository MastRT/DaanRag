from fastapi import FastAPI,UploadFile,File
from pydantic import BaseModel
import os
from fastapi.middleware.cors import CORSMiddleware
from src.reader import reader
from src.chunck import Chunker
from src.embeddings import EmbeddingService
from src.vector_store import VectorStore
from src.llm import LLMService

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "data/uploads"

os.makedirs(UPLOAD_DIR,exist_ok=True)

embedding_service = EmbeddingService()

vector_store = VectorStore()

llm_service = LLMService()

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(file_path,"wb") as buffer:
        buffer.write(await file.read())

    pdf_reader = reader(file_path)
    pages = pdf_reader.read()

    chuncker = Chunker(500,100,pages)
    chunks = chuncker.create_chunks()
    chunk_text = [chunk["text"] for chunk in chunks]
    
    embeddings = embedding_service.encode(chunk_text)

    vector_store.add_documents(chunks,embeddings,file.filename)
    
    
    return{
        "filename" : file.filename,
        "chunks": len(chunks),
        "message" : "file uploaded and indexed successfully"
    }

class Question(BaseModel):
    question: str

@app.post("/ask")
async def ask_question(data: Question):

    query_embedding = embedding_service.encode_query(data.question)
    results = vector_store.search(query_embedding,limit=3)
    retrieved_chunks = []

    for result in results:
        text = result.payload["text"]
        page = result.payload["page"]

        retrieved_chunks.append({
            "text":text,
            "page":page,
            "score":result.score,
        })
    context = "\n\n".join(
        f"""[بخش {i + 1}]
        {item["text"]}"""
        for i, item in enumerate(retrieved_chunks))
    #----------------    
    print("\n" + "=" * 50)
    print("QUESTION:")
    print(data.question)

    print("\nCONTEXT:")
    print(context)

    print("\nRETRIEVED CHUNKS:")
    for item in retrieved_chunks:
        print("PAGE:", item["page"])
        print("SCORE:", item["score"])
        print("TEXT:", item["text"])
        print("-" * 50)

    print("=" * 50 + "\n")
    #----------------
    answer = llm_service.generate_answer(context,data.question)
    sources = []

    for item in retrieved_chunks:
        sources.append({
            "page": item["page"],
            "score": item["score"]
        })

    return{
        "question":data.question,
        "answer":answer,
        "sources":sources
    }