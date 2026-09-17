# Architecture: Proofline System Design

## 1. System Philosophy

Proofline is designed around the core principle of **Verifiable Grounding**. Unlike typical conversational wrappers over LLMs, Proofline structures the entire document ingestion and retrieval lifecycle so that:
1. Every piece of raw document text is tracked by page number and sequential offsets.
2. Structured entities are extracted deterministically into strongly typed data models.
3. Live generative responses strictly cite the source page and passage.
4. The user interface connects the answer directly to the original document coordinates.

---

## 2. High-Level Component Architecture

```
                                  +-----------------------------+
                                  |       User Browser          |
                                  +--------------+--------------+
                                                 |
                                     Next.js Frontend (SSR/CSR)
                                     - App Router (React 18)
                                     - Tailwind CSS Design System
                                     - lib/api.ts Client Layer
                                                 |
                                                 | HTTPS / REST (JWT Auth)
                                                 v
                                  +-----------------------------+
                                  |      FastAPI Backend        |
                                  +--------------+--------------+
                                                 |
         +---------------------------------------+---------------------------------------+
         |                                       |                                       |
         v                                       v                                       v
+------------------+                   +--------------------+                  +--------------------+
|  Document Engine |                   | Database (ORM)     |                  |   AI Abstraction   |
+------------------+                   +--------------------+                  +--------------------+
| • DocumentService|                   | • SQLAlchemy 2.0   |                  | • BaseAIProvider   |
| • ExtractionSvc  |                   | • User Model       |                  | • GeminiProvider   |
| • OCRService     |                   | • Document Model   |                  | • LocalProvider    |
| • pypdf/Pillow   |                   | • Analysis Model   |                  | • AIService        |
| • Local Storage  |                   | • ChatSession/Msg  |                  | • Strict Grounding |
+------------------+                   +--------------------+                  +--------------------+
```

---

## 3. Data Models & Schema Relationships

### 3.1 Relational Diagram

```
+---------------+
|     User      |
|---------------|
| id (UUID)     |<----+
| email         |     |
| password_hash |     |
| name          |     |
+---------------+     |
                      | 1:N
                      |
+---------------+     |
|   Document    |     |
|---------------|     |
| id (UUID)     |-----+
| user_id (FK)  |
| filename      |
| original_name |
| file_type     |
| file_size     |
| status        |
| extracted_text|<--------------------+
+---------------+                     |
        |                             |
        | 1:1                         | 1:N
        v                             v
+--------------------+        +--------------------+
|  DocumentAnalysis  |        |    ChatSession     |
|--------------------|        |--------------------|
| id (UUID)          |        | id (UUID)          |
| document_id (FK)   |        | document_id (FK)   |
| document_type      |        | user_id (FK)       |
| summary            |        +--------------------+
| key_points (JSON)  |                  |
| entities (JSON)    |                  | 1:N
+--------------------+                  v
                              +--------------------+
                              |    ChatMessage     |
                              |--------------------|
                              | id (UUID)          |
                              | session_id (FK)    |
                              | role (user/ai)     |
                              | content            |
                              | sources (JSON)     |
                              +--------------------+
```

---

## 4. Processing Pipeline Detail

### Step 1: Upload & Sanitization
1. Frontend performs client-side validation (file size <= 10MB, extension: `.pdf`, `.png`, `.jpg`, `.jpeg`).
2. Transmitted via multipart/form-data to `POST /api/documents/upload`.
3. Backend validates magic numbers and generates a secure UUID filename.
4. Document record is inserted into the database with `status = "processing"`.

### Step 2: Extraction & Page Segmentation
1. `ExtractionService` parses the binary file.
2. For PDFs: reads each page using `pypdf`/`pdfplumber`, generating a normalized JSON list of pages:
   ```json
   [
     {"page": 1, "text": "Invoice Number: INV-2026-1042\nTotal: ₹45,000..."},
     {"page": 2, "text": "Terms and conditions..."}
   ]
   ```
3. For Images: uses PIL / OCR service to read text.
4. Persists the serialized page data into `Document.extracted_text`.

### Step 3: Entity Extraction & Summarization
1. `AIService` sends document text to the configured AI provider (`GeminiProvider`).
2. AI extracts:
   - Document classification (`Invoice`, `Contract`, `Report`, etc.)
   - High-level executive summary
   - 3–5 bulleted key takeaways
   - Structured entities: amounts, dates, orgs, people, document numbers
3. Persists into `DocumentAnalysis` record and marks `Document.status = "ready"`.

### Step 4: Grounded Q&A with Citation Generation
1. User enters question via `POST /api/documents/{id}/chat`.
2. Backend assembles the context using the extracted page data.
3. System prompt directs Gemini to identify the exact page and source excerpt.
4. The returned response contains both the synthesized answer and the `sources` array.
5. Saved to `ChatMessage` history.

---

## 5. Security & Isolation

1. **Authentication**: Signed JWT tokens using HMAC-SHA256. Passwords hashed using bcrypt.
2. **Authorization**: Every database query on `Document`, `DocumentAnalysis`, and `ChatSession` includes `user_id == current_user.id`. Users cannot view or query documents belonging to another user.
3. **No Frontend Secrets**: The Google Gemini API key is strictly isolated to backend services and never sent to or embedded within client code.
4. **Input Sanitization**: File names are sanitized and stored as randomized UUIDs on the file system to prevent directory traversal attacks.
