import os
import sys
import json

sys.path.insert(0, os.path.dirname(__file__))

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db

init_db()
client = TestClient(app)

def test_full_api_flow():
    print("=== Testing Full API Endpoints Flow ===")

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200
    print("✓ GET /api/health passed")

    # 2. Signup User 1
    signup_data = {
        "name": "Alex Mercer",
        "email": "alex.mercer@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    res = client.post("/api/auth/signup", json=signup_data)
    if res.status_code == 400 and "already exists" in res.text:
        # Login instead
        res = client.post("/api/auth/login", json={"email": signup_data["email"], "password": signup_data["password"]})
    assert res.status_code in [200, 201]
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✓ POST /api/auth/signup or login passed")

    # 3. GET /api/auth/me
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200
    user_data = res.json()
    assert user_data["email"] == "alex.mercer@example.com"
    print(f"✓ GET /api/auth/me passed for {user_data['name']}")

    # 4. Upload sample document
    sample_pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample_data", "sample_invoice.pdf"))
    with open(sample_pdf_path, "rb") as f:
        res = client.post(
            "/api/documents/upload",
            headers=headers,
            files={"file": ("sample_invoice.pdf", f, "application/pdf")}
        )
    assert res.status_code == 201, f"Upload failed: {res.text}"
    doc = res.json()
    doc_id = doc["id"]
    print(f"✓ POST /api/documents/upload passed. Document ID: {doc_id}, Status: {doc['status']}")
    assert doc["status"] == "ready"
    assert doc["analysis"] is not None

    # 5. GET /api/documents
    res = client.get("/api/documents", headers=headers)
    assert res.status_code == 200
    doc_list = res.json()
    assert doc_list["total"] >= 1
    print(f"✓ GET /api/documents passed. Total docs: {doc_list['total']}")

    # 6. GET /api/documents/{id}
    res = client.get(f"/api/documents/{doc_id}", headers=headers)
    assert res.status_code == 200
    detail = res.json()
    assert len(detail["extracted_text_pages"]) == 2
    print(f"✓ GET /api/documents/{doc_id} passed. Pages: {len(detail['extracted_text_pages'])}")

    # 7. Ask live AI question: "What is the total amount?"
    res = client.post(
        f"/api/documents/{doc_id}/chat",
        headers=headers,
        json={"question": "What is the total amount?"}
    )
    assert res.status_code == 200
    chat_ans = res.json()
    print(f"✓ POST /api/documents/{doc_id}/chat passed.")
    print(f"  Answer: {chat_ans['content']}")
    print(f"  Sources: {chat_ans['sources']}")
    assert "45,000" in chat_ans["content"]
    assert len(chat_ans["sources"]) > 0

    # 8. GET /api/documents/{id}/chat history
    res = client.get(f"/api/documents/{doc_id}/chat", headers=headers)
    assert res.status_code == 200
    history = res.json()
    assert len(history["messages"]) >= 2
    print(f"✓ GET /api/documents/{doc_id}/chat history passed. Total messages: {len(history['messages'])}")

    # 9. GET /api/dashboard/stats
    res = client.get("/api/dashboard/stats", headers=headers)
    assert res.status_code == 200
    stats = res.json()
    assert stats["total_documents"] >= 1
    assert stats["total_questions"] >= 1
    print(f"✓ GET /api/dashboard/stats passed: {stats}")

    # 10. Test User Isolation: User 2 cannot access User 1's document
    res = client.post("/api/auth/signup", json={
        "name": "Second User",
        "email": "second.user@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    if res.status_code == 400:
        res = client.post("/api/auth/login", json={"email": "second.user@example.com", "password": "Password123!"})
    token2 = res.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # User 2 tries to access User 1's document
    res = client.get(f"/api/documents/{doc_id}", headers=headers2)
    assert res.status_code == 404, f"Security violation: Expected 404, got {res.status_code}"
    print("✓ Security Check: User 2 correctly blocked from accessing User 1's document (404)")

    # 11. Delete document
    res = client.delete(f"/api/documents/{doc_id}", headers=headers)
    assert res.status_code == 204
    print(f"✓ DELETE /api/documents/{doc_id} passed.")

    # Confirm deletion
    res = client.get(f"/api/documents/{doc_id}", headers=headers)
    assert res.status_code == 404
    print("✓ Verified document deleted successfully.")

    print("\n>>> ALL API ENDPOINT AND SECURITY TESTS PASSED! <<<")

if __name__ == "__main__":
    test_full_api_flow()
