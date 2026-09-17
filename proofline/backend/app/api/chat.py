import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import ChatQuestionRequest, ChatMessageResponse, ChatHistoryResponse, SourceItem
from app.services.auth_service import get_current_user
from app.services.extraction_service import ExtractionService
from app.ai.service import ai_service

router = APIRouter(prefix="/api/documents", tags=["chat"])


def _parse_sources(sources_raw: Optional[str]) -> Optional[List[SourceItem]]:
    if not sources_raw:
        return None
    try:
        data = json.loads(sources_raw)
        return [SourceItem(page=s.get("page", 1), text=s.get("text", "")) for s in data]
    except Exception:
        return None


@router.post("/{id}/chat", response_model=ChatMessageResponse)
async def ask_question(
    id: str,
    req: ChatQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    # Find or create chat session
    session = db.query(ChatSession).filter(
        ChatSession.document_id == doc.id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        session = ChatSession(document_id=doc.id, user_id=current_user.id)
        db.add(session)
        db.commit()
        db.refresh(session)

    # 1. Save User question message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=req.question.strip(),
        sources=None
    )
    db.add(user_msg)
    db.commit()

    # 2. Extract pages context & invoke grounded AI
    pages = ExtractionService.deserialize_pages(doc.extracted_text)
    ai_response = await ai_service.answer_question(req.question.strip(), pages)

    answer_text = ai_response.get("answer", "I couldn't find that information in the uploaded document.")
    sources_data = ai_response.get("sources", [])

    # 3. Save Assistant message
    asst_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=answer_text,
        sources=json.dumps(sources_data) if sources_data else None
    )
    db.add(asst_msg)
    db.commit()
    db.refresh(asst_msg)

    return ChatMessageResponse(
        id=asst_msg.id,
        role=asst_msg.role,
        content=asst_msg.content,
        sources=_parse_sources(asst_msg.sources),
        created_at=asst_msg.created_at
    )


@router.get("/{id}/chat", response_model=ChatHistoryResponse)
def get_chat_history(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    session = db.query(ChatSession).filter(
        ChatSession.document_id == doc.id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        return ChatHistoryResponse(
            session_id="",
            document_id=doc.id,
            messages=[]
        )

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    formatted_messages = [
        ChatMessageResponse(
            id=m.id,
            role=m.role,
            content=m.content,
            sources=_parse_sources(m.sources),
            created_at=m.created_at
        )
        for m in messages
    ]

    return ChatHistoryResponse(
        session_id=session.id,
        document_id=doc.id,
        messages=formatted_messages
    )
