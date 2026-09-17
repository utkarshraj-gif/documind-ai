from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ExtractedEntities(BaseModel):
    document_type: str = "Document"
    person_names: List[str] = Field(default_factory=list)
    organizations: List[str] = Field(default_factory=list)
    dates: List[str] = Field(default_factory=list)
    addresses: List[str] = Field(default_factory=list)
    amounts: List[str] = Field(default_factory=list)
    document_numbers: List[str] = Field(default_factory=list)


class DocumentAnalysisResponse(BaseModel):
    id: str
    document_id: str
    document_type: str
    summary: str
    key_points: List[str]
    extracted_entities: ExtractedEntities
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
