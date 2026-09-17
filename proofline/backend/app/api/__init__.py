from app.api.auth import router as auth_router
from app.api.documents import router as documents_router
from app.api.analysis import router as analysis_router
from app.api.chat import router as chat_router
from app.api.dashboard import router as dashboard_router

__all__ = ["auth_router", "documents_router", "analysis_router", "chat_router", "dashboard_router"]
