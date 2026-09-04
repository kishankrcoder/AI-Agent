from fastapi import FastAPI, UploadFile, File
from app.models import ChatRequest, ChatResponse
from app.graph import agent_graph
from app.rag import ingest_pdf
import os


app = FastAPI(
    title="AI Agent API",
    description="Personal AI Agent Backend",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "AI Agent API is running!"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/chat", response_model=ChatResponse)
def chat_with_agent(request: ChatRequest):

    result = agent_graph.invoke({
        "message": request.message,
        "response": ""
    })

    return {
        "response": result["response"]
    }


@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):

    os.makedirs("data", exist_ok=True)

    file_path = os.path.join(
        "data",
        file.filename
    )

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    result = ingest_pdf(file_path)

    return {
        "filename": file.filename,
        "message": result
    }