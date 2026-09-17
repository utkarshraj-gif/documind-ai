import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from app.config import settings

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/octet-stream"  # sometimes browsers send this
}
MAX_SIZE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


class DocumentService:
    @staticmethod
    def validate_file(file: UploadFile) -> str:
        # Check filename
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to upload this document. Empty filename."
            )

        suffix = Path(file.filename).suffix.lower()
        if suffix not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{suffix}'. Allowed formats: PDF, PNG, JPG, JPEG."
            )

        return suffix

    @staticmethod
    async def save_upload_file(file: UploadFile, suffix: str) -> tuple[str, str, int]:
        # Generate safe storage filename
        stored_filename = f"{uuid.uuid4()}{suffix}"
        file_path = os.path.join(settings.UPLOAD_DIR, stored_filename)

        size = 0
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                size += len(chunk)
                if size > MAX_SIZE_BYTES:
                    buffer.close()
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
                    )
                buffer.write(chunk)

        mime_type = file.content_type or "application/octet-stream"
        if suffix == ".pdf":
            mime_type = "application/pdf"
        elif suffix in [".jpg", ".jpeg"]:
            mime_type = "image/jpeg"
        elif suffix == ".png":
            mime_type = "image/png"

        return stored_filename, mime_type, size

    @staticmethod
    def get_file_path(filename: str) -> str:
        return os.path.join(settings.UPLOAD_DIR, filename)

    @staticmethod
    def delete_physical_file(filename: str):
        file_path = DocumentService.get_file_path(filename)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass
