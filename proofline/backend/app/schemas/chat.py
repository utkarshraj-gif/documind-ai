from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class SourceItem(BaseModel):
    page: int
    text: str


class ChatQuestionRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)


class ChatMessageResponse(BaseModel):
    id: str
    role: str  # "user" or "assistant"
    content: str
    sources: Optional[List[SourceItem]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    session_id: str
    document_id: str
    messages: List[ChatMessageResponse]
