from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
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


# ==========================================
# APP
# ==========================================

app = FastAPI(
    title="AI Agent API",
    description="Personal AI Agent Backend",
    version="1.0.0",
)


memory = ConversationMemory()


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ai-agent-ten-red.vercel.app",
        "https://ai-agent-jzy58wcp7-aevion1.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# ROOT
# ==========================================

@app.get("/")
def root():
    return {
        "message": "AI Agent API is running!"
    }


# ==========================================
# HEALTH
# ==========================================

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

    try:

        result = agent_graph.invoke({
            "session_id": request.session_id,
            "message": request.message,
            "response": {},
            "route": "",
        })

        agent_response = result.get(
            "response",
            {}
        )

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

    except Exception as e:

        print("CHAT ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=f"Agent error: {str(e)}"
        )


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
# PDF UPLOAD
# ==========================================

@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...)
):

    if file.content_type != "application/pdf":

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    try:

        os.makedirs(
            "data",
            exist_ok=True
        )

        safe_filename = os.path.basename(
            file.filename
        )

        file_path = os.path.join(
            "data",
            safe_filename
        )

        file_content = await file.read()

        with open(
            file_path,
            "wb"
        ) as buffer:

            buffer.write(
                file_content
            )

        result = ingest_pdf(
            file_path,
            document_name=safe_filename,
        )

        return {
            "filename": safe_filename,
            "message": result,
        }

    except Exception as e:

        print("PDF ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=f"PDF processing failed: {str(e)}"
        )