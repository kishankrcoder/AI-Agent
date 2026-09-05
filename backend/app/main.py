from fastapi import (
    FastAPI,
    UploadFile,
    File,
)

from fastapi.middleware.cors import CORSMiddleware

from app.models import (
    ChatRequest,
    ChatResponse,
)

from app.graph import agent_graph
from app.rag import ingest_pdf
from app.memory import ConversationMemory

import os


app = FastAPI(
    title="AI Agent API",
    description="Personal AI Agent Backend",
    version="1.0.0",
)


memory = ConversationMemory()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ai-agent-ten-red.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


# ==========================================
# CHAT
# ==========================================

@app.post(
    "/chat",
    response_model=ChatResponse
)
def chat_with_agent(
    request: ChatRequest
):

    result = agent_graph.invoke({
        "session_id": request.session_id,
        "message": request.message,
        "response": {},
        "route": "",
    })

    agent_response = result["response"]

    return {
        "response": agent_response.get(
            "response",
            ""
        ),
        "tool_usage": agent_response.get(
            "tool_usage",
            []
        ),
        "sources": agent_response.get(
            "sources",
            []
        ),
    }


# ==========================================
# CONVERSATIONS
# ==========================================

@app.get("/conversations")
def get_conversations():
    return memory.get_conversations()


@app.post("/conversations")
def create_conversation():
    return memory.create_conversation()


@app.get(
    "/conversations/{session_id}/messages"
)
def get_conversation_messages(
    session_id: str
):
    return memory.get_messages(
        session_id
    )


@app.patch(
    "/conversations/{session_id}"
)
def rename_conversation(
    session_id: str,
    title: str
):

    memory.rename_conversation(
        session_id,
        title
    )

    return {
        "id": session_id,
        "title": title,
    }


@app.delete(
    "/conversations/{session_id}"
)
def delete_conversation(
    session_id: str
):

    memory.delete_conversation(
        session_id
    )

    return {
        "message":
        "Conversation deleted successfully"
    }


# ==========================================
# PERSONAL MEMORY
# ==========================================

@app.get("/memories")
def get_memories():

    return {
        "memories":
        memory.get_memories()
    }


@app.delete("/memories")
def clear_memories():

    memory.clear_memories()

    return {
        "message":
        "All memories cleared successfully"
    }


@app.delete("/memories/item")
def delete_memory(
    content: str
):

    memory.delete_memory(
        content
    )

    return {
        "message":
        "Memory deleted successfully"
    }


# ==========================================
# PDF
# ==========================================

@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...)
):

    if file.content_type != "application/pdf":

        return {
            "filename": file.filename,
            "message":
            "Only PDF files are supported.",
        }

    os.makedirs(
        "data",
        exist_ok=True
    )

    file_path = os.path.join(
        "data",
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        buffer.write(
            await file.read()
        )

    result = ingest_pdf(
        file_path,
        document_name=file.filename,
    )

    return {
        "filename": file.filename,
        "message": result,
    }