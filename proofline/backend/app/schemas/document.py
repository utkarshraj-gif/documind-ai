from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel
from app.schemas.analysis import DocumentAnalysisResponse


class DocumentPageText(BaseModel):
    page: int
    text: str


class DocumentResponse(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentDetailResponse(DocumentResponse):
    extracted_text_pages: Optional[List[DocumentPageText]] = None
    analysis: Optional[DocumentAnalysisResponse] = None
    chat_session_id: Optional[str] = None


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int
