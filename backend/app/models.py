from pydantic import BaseModel, Field
from typing import List


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ToolUsage(BaseModel):
    name: str
    status: str


class ChatResponse(BaseModel):
    response: str
    tool_usage: List[ToolUsage] = Field(default_factory=list)
    sources: List[str] = Field(default_factory=list)