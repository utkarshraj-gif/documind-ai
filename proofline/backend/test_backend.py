import os
import sys
import json

# Ensure app is importable
sys.path.insert(0, os.path.dirname(__file__))

# Enable UTF-8 printing in Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from app.database import init_db, SessionLocal
from app.services.auth_service import get_password_hash, verify_password, create_access_token
from app.services.extraction_service import ExtractionService
from app.ai.service import ai_service
import asyncio

async def test_pipeline():
    print("=== 1. Initializing Database ===")
    init_db()
    print("Database tables initialized successfully.")

    print("\n=== 2. Testing Password & JWT ===")
    hashed = get_password_hash("password123")
    assert verify_password("password123", hashed)
    assert not verify_password("wrong", hashed)
    token = create_access_token({"sub": "test_user_id"})
    print("Password hashing and JWT generation passed.")

    print("\n=== 3. Testing PDF Extraction on Sample Invoice ===")
    sample_pdf = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample_data", "sample_invoice.pdf"))
    assert os.path.exists(sample_pdf), f"Sample PDF missing at {sample_pdf}"
    pages = ExtractionService.extract_document(sample_pdf, "application/pdf")
    print(f"Extracted {len(pages)} pages.")
    assert len(pages) == 2, f"Expected 2 pages, got {len(pages)}"

    print("\n=== 4. Testing AI Summarization ===")
    summary = await ai_service.summarize_document(pages)
    print(f"Document Type: {summary.get('document_type')}")
    print(f"Summary: {summary.get('summary')}")
    print(f"Key Points: {summary.get('key_points')}")

    print("\n=== 5. Testing Information Extraction ===")
    entities = await ai_service.extract_information(pages)
    print(f"Entities: {json.dumps(entities, indent=2)}")
    assert "amounts" in entities
    assert "document_numbers" in entities
    assert "INV-2026-1042" in entities["document_numbers"]

    print("\n=== 6. Testing Live AI Q&A Grounding ===")
    q1 = "What is the total amount?"
    ans1 = await ai_service.answer_question(q1, pages)
    print(f"Q: {q1}")
    print(f"A: {ans1.get('answer')}")
    print(f"Sources: {ans1.get('sources')}")
    assert "45,000" in ans1.get("answer")
    assert len(ans1.get("sources", [])) > 0

    q2 = "Who is the president of France?"
    ans2 = await ai_service.answer_question(q2, pages)
    print(f"\nQ: {q2}")
    print(f"A: {ans2.get('answer')}")
    assert "couldn't find" in ans2.get("answer").lower()

    print("\n>>> ALL BACKEND CORE TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    asyncio.run(test_pipeline())
