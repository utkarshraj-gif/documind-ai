import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.models.analysis import DocumentAnalysis
from app.schemas.analysis import DocumentAnalysisResponse, ExtractedEntities
from app.services.auth_service import get_current_user
from app.services.extraction_service import ExtractionService
from app.ai.service import ai_service

router = APIRouter(prefix="/api/documents", tags=["analysis"])


def _format_analysis(analysis: DocumentAnalysis) -> DocumentAnalysisResponse:
    try:
        key_points = json.loads(analysis.key_points)
    except Exception:
        key_points = []
    try:
        entities_data = json.loads(analysis.extracted_entities)
        entities = ExtractedEntities(**entities_data)
    except Exception:
        entities = ExtractedEntities(document_type=analysis.document_type)

    return DocumentAnalysisResponse(
        id=analysis.id,
        document_id=analysis.document_id,
        document_type=analysis.document_type,
        summary=analysis.summary,
        key_points=key_points,
        extracted_entities=entities,
        created_at=analysis.created_at,
        updated_at=analysis.updated_at
    )


@router.post("/{id}/analyze", response_model=DocumentAnalysisResponse)
async def analyze_document(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    pages = ExtractionService.deserialize_pages(doc.extracted_text)
    summary_result = await ai_service.summarize_document(pages)
    entities_result = await ai_service.extract_information(pages)

    analysis = db.query(DocumentAnalysis).filter(DocumentAnalysis.document_id == doc.id).first()
    if not analysis:
        analysis = DocumentAnalysis(document_id=doc.id)
        db.add(analysis)

    analysis.document_type = summary_result.get("document_type", "Document")
    analysis.summary = summary_result.get("summary", "")
    analysis.key_points = json.dumps(summary_result.get("key_points", []))
    analysis.extracted_entities = json.dumps(entities_result)

    db.commit()
    db.refresh(analysis)
    return _format_analysis(analysis)


@router.post("/{id}/summary", response_model=DocumentAnalysisResponse)
async def regenerate_summary(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    pages = ExtractionService.deserialize_pages(doc.extracted_text)
    summary_result = await ai_service.summarize_document(pages)

    analysis = db.query(DocumentAnalysis).filter(DocumentAnalysis.document_id == doc.id).first()
    if not analysis:
        entities_result = await ai_service.extract_information(pages)
        analysis = DocumentAnalysis(
            document_id=doc.id,
            document_type=summary_result.get("document_type", "Document"),
            summary=summary_result.get("summary", ""),
            key_points=json.dumps(summary_result.get("key_points", [])),
            extracted_entities=json.dumps(entities_result)
        )
        db.add(analysis)
    else:
        analysis.summary = summary_result.get("summary", "")
        analysis.key_points = json.dumps(summary_result.get("key_points", []))

    db.commit()
    db.refresh(analysis)
    return _format_analysis(analysis)
