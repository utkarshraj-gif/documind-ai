from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.api import (
    auth_router,
    documents_router,
    analysis_router,
    chat_router,
    dashboard_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Proofline: Turn documents into answers you can verify.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Error Handling to prevent raw stack traces leaking
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


# Health check
@app.get("/api/health", tags=["system"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "ai_provider": settings.AI_PROVIDER,
        "database": "connected",
    }


# Include API routers
app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(analysis_router)
app.include_router(chat_router)
app.include_router(dashboard_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
