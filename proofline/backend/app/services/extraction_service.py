import json
import os
from typing import List, Dict, Any
from pypdf import PdfReader
from app.services.ocr_service import OCRService


class ExtractionService:
    @staticmethod
    def extract_document(file_path: str, file_type: str) -> List[Dict[str, Any]]:
        """
        Extracts content page-by-page.
        Returns a list of dicts: [{"page": 1, "text": "..."}]
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        pages: List[Dict[str, Any]] = []

        if file_type == "application/pdf" or file_path.lower().endswith(".pdf"):
            try:
                reader = PdfReader(file_path)
                for index, page in enumerate(reader.pages):
                    page_num = index + 1
                    raw_text = page.extract_text() or ""
                    # Normalize whitespace but preserve paragraph structure
                    cleaned_lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
                    cleaned_text = "\n".join(cleaned_lines)

                    if not cleaned_text:
                        cleaned_text = f"[Page {page_num}: No readable text layer found. Scanned or image content.]"

                    pages.append({
                        "page": page_num,
                        "text": cleaned_text
                    })
            except Exception as e:
                pages.append({
                    "page": 1,
                    "text": f"[Error reading PDF pages: {str(e)}]"
                })
        else:
            # Images (PNG, JPG, JPEG)
            img_text = OCRService.extract_text_from_image(file_path)
            pages.append({
                "page": 1,
                "text": img_text
            })

        if not pages:
            pages.append({
                "page": 1,
                "text": "[Empty document]"
            })

        return pages

    @staticmethod
    def serialize_pages(pages: List[Dict[str, Any]]) -> str:
        return json.dumps(pages, ensure_ascii=False)

    @staticmethod
    def deserialize_pages(serialized: str) -> List[Dict[str, Any]]:
        if not serialized:
            return []
        try:
            return json.loads(serialized)
        except Exception:
            return [{"page": 1, "text": serialized}]
