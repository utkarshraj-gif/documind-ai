import json
import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.models.analysis import DocumentAnalysis
from app.models.chat import ChatSession
from app.schemas.document import DocumentResponse, DocumentDetailResponse, DocumentListResponse, DocumentPageText
from app.schemas.analysis import DocumentAnalysisResponse, ExtractedEntities
from app.services.auth_service import get_current_user
from app.services.document_service import DocumentService
from app.services.extraction_service import ExtractionService
from app.ai.service import ai_service

router = APIRouter(prefix="/api/documents", tags=["documents"])


def _format_analysis_response(analysis: Optional[DocumentAnalysis]) -> Optional[DocumentAnalysisResponse]:
    if not analysis:
        return None
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


@router.post("/upload", response_model=DocumentDetailResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Validate file format
    suffix = DocumentService.validate_file(file)

    # 2. Save physical file to disk
    stored_filename, mime_type, file_size = await DocumentService.save_upload_file(file, suffix)
    file_path = DocumentService.get_file_path(stored_filename)

    # 3. Create document record
    doc = Document(
        user_id=current_user.id,
        filename=stored_filename,
        original_filename=file.filename,
        file_type=mime_type,
        file_size=file_size,
        status="processing"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    try:
        # 4. Text Extraction
        pages = ExtractionService.extract_document(file_path, mime_type)
        doc.extracted_text = ExtractionService.serialize_pages(pages)

        # 5. AI Analysis & Entity Extraction
        summary_result = await ai_service.summarize_document(pages)
        entities_result = await ai_service.extract_information(pages)

        # 6. Save DocumentAnalysis
        analysis = DocumentAnalysis(
            document_id=doc.id,
            document_type=summary_result.get("document_type", "Document"),
            summary=summary_result.get("summary", ""),
            key_points=json.dumps(summary_result.get("key_points", [])),
            extracted_entities=json.dumps(entities_result)
        )
        db.add(analysis)

        # 7. Create initial ChatSession for the document
        chat_session = ChatSession(
            user_id=current_user.id,
            document_id=doc.id
        )
        db.add(chat_session)

        doc.status = "ready"
        db.commit()
        db.refresh(doc)
        db.refresh(analysis)
        db.refresh(chat_session)

        pages_obj = [DocumentPageText(page=p["page"], text=p["text"]) for p in pages]

        return DocumentDetailResponse(
            id=doc.id,
            filename=doc.filename,
            original_filename=doc.original_filename,
            file_type=doc.file_type,
            file_size=doc.file_size,
            status=doc.status,
            created_at=doc.created_at,
            updated_at=doc.updated_at,
            extracted_text_pages=pages_obj,
            analysis=_format_analysis_response(analysis),
            chat_session_id=chat_session.id
        )

    except Exception as e:
        doc.status = "failed"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document processing failed: {str(e)}"
        )


@router.get("", response_model=DocumentListResponse)
def list_documents(
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query("desc"),  # asc or desc
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Document).filter(Document.user_id == current_user.id)

    if search:
        query = query.filter(Document.original_filename.ilike(f"%{search}%"))

    if status_filter:
        query = query.filter(Document.status == status_filter)

    if sort == "asc":
        query = query.order_by(asc(Document.created_at))
    else:
        query = query.order_by(desc(Document.created_at))

    docs = query.all()
    return DocumentListResponse(
        documents=[DocumentResponse.model_validate(d) for d in docs],
        total=len(docs)
    )


@router.get("/{id}", response_model=DocumentDetailResponse)
def get_document(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    raw_pages = ExtractionService.deserialize_pages(doc.extracted_text)
    pages_obj = [DocumentPageText(page=p.get("page", 1), text=p.get("text", "")) for p in raw_pages]

    chat_session = db.query(ChatSession).filter(ChatSession.document_id == doc.id).first()
    chat_session_id = chat_session.id if chat_session else None

    return DocumentDetailResponse(
        id=doc.id,
        filename=doc.filename,
        original_filename=doc.original_filename,
        file_type=doc.file_type,
        file_size=doc.file_size,
        status=doc.status,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        extracted_text_pages=pages_obj,
        analysis=_format_analysis_response(doc.analysis),
        chat_session_id=chat_session_id
    )


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    # Delete physical file
    DocumentService.delete_physical_file(doc.filename)

    # Delete from DB (cascades analysis and chat sessions)
    db.delete(doc)
    db.commit()
    return None


@router.get("/{id}/file")
def get_document_file(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    file_path = DocumentService.get_file_path(doc.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Physical file missing from storage.")

    return FileResponse(
        path=file_path,
        media_type=doc.file_type,
        filename=doc.original_filename
    )
