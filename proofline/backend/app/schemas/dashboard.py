from typing import List
from pydantic import BaseModel
from app.schemas.document import DocumentResponse


class DashboardStatsResponse(BaseModel):
    total_documents: int
    ready_documents: int
    processing_documents: int
    total_questions: int
    recent_documents: List[DocumentResponse]
