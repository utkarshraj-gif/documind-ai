import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class DocumentAnalysis(Base):
    __tablename__ = "document_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    document_type = Column(String(100), default="Document", nullable=False)
    summary = Column(Text, nullable=False)
    key_points = Column(Text, nullable=False)  # JSON-encoded list of strings
    extracted_entities = Column(Text, nullable=False)  # JSON-encoded dict of entities
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    document = relationship("Document", back_populates="analysis")
