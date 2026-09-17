from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.models.chat import ChatMessage, ChatSession
from app.schemas.dashboard import DashboardStatsResponse
from app.schemas.document import DocumentResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_docs = db.query(Document).filter(Document.user_id == current_user.id)

    total_docs = user_docs.count()
    ready_docs = user_docs.filter(Document.status == "ready").count()
    processing_docs = user_docs.filter(Document.status == "processing").count()

    # Total questions asked across user's documents
    user_sessions = db.query(ChatSession.id).filter(ChatSession.user_id == current_user.id).scalar_subquery()
    total_questions = db.query(ChatMessage).filter(
        ChatMessage.session_id.in_(user_sessions),
        ChatMessage.role == "user"
    ).count()

    recent_docs = (
        user_docs.order_by(desc(Document.created_at))
        .limit(6)
        .all()
    )

    return DashboardStatsResponse(
        total_documents=total_docs,
        ready_documents=ready_docs,
        processing_documents=processing_docs,
        total_questions=total_questions,
        recent_documents=[DocumentResponse.model_validate(d) for d in recent_docs]
    )
