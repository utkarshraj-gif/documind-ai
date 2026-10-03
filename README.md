# Proofline
**Test change for n8n Code Reviewer Agent  ok**
> **"Turn documents into answers you can verify."**

Proofline is a production-grade, full-stack AI document analysis and verification platform. Unlike conventional chatbots that hallucinate or provide opaque answers, Proofline grounds every insight in the exact source document—complete with page citations, extracted entity verification, and interactive source jumps.

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Core Features](#core-features)
3. [Architecture & Data Flow](#architecture--data-flow)
4. [Tech Stack](#tech-stack)
5. [Directory Structure](#directory-structure)
6. [System Requirements](#system-requirements)
7. [Quick Start (Windows Native)](#quick-start-windows-native)
   - [Environment Configuration](#1-environment-configuration)
   - [Database Setup](#2-database-setup-postgresql--sqlite)
   - [Backend Setup (FastAPI & Python 3.12)](#3-backend-setup)
   - [Frontend Setup (Next.js & React 18)](#4-frontend-setup)
8. [Google Gemini AI Integration](#google-gemini-ai-integration)
9. [API Reference](#api-reference)
10. [End-to-End Demo Workflow](#end-to-end-demo-workflow)
11. [Troubleshooting & Windows Tips](#troubleshooting--windows-tips)

---

## Product Overview

When organizations analyze contracts, invoices, financial statements, or technical reports, they cannot rely on generic generative AI that might invent facts or miscalculate figures. Proofline provides:

1. **Deterministic Extraction**: Extracts text with page-level mapping and structured entities (financial totals, invoice/contract numbers, key dates, organizations, and signatories).
2. **Strict Grounding**: The AI is constrained to answer *only* using the verified content extracted from the document. If a detail is missing, it explicitly states it cannot be found.
3. **Verifiable Source Citations**: Every answer includes the exact page number and text snippet from the document. Users can click **"View source"** to jump to the page and inspect the highlighted passage.
4. **Three-Panel Verification Workspace**:
   - **Panel 1: Document Viewer** — Zoomable multi-page document preview with search and citation highlighting.
   - **Panel 2: Extracted Data** — Clean structured entity badges and page-by-page extracted text.
   - **Panel 3: AI Analysis & Q&A** — Executive summary, key points, suggested questions, and live grounded conversation history.

---

## Core Features

- **Document Ingestion**: Supports PDF, PNG, JPG, and JPEG files up to 10 MB.
- **Multi-Stage Processing Timeline**: Real-time visual tracking through 5 discrete stages: `Uploading` → `Reading` → `Extracting` → `Analyzing` → `Ready`.
- **Entity Extraction**: Automatically extracts and categorizes:
  - Document Numbers (e.g., `INV-2026-1042`)
  - Key Dates (Issued, Due, Effective dates)
  - Financial Amounts & Currencies (e.g., `₹45,000`, `$12,500`)
  - Organizations & Vendors
  - Signatories & Person Names
  - Addresses
- **Executive Summaries**: AI-synthesized summaries with key takeaways and on-demand regeneration.
- **Source-Aware Document Q&A**: Real-time natural language query interface with suggested quick prompts and verifiable source links.
- **Robust Authentication**: Secure signup and login with hashed passwords (bcrypt), JWT bearer tokens, and strict user-level document isolation.
- **Cross-Document Assistant**: Dedicated assistant page (`/assistant`) allowing users to query any of their uploaded documents.
- **Editorial Design**: Purpose-built, calm, and distraction-free aesthetic with warm neutral surfaces, high-contrast typography, and zero generic AI clichés (no neon gradients, no robot illustrations, no random chart clutter).

---

## Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                          NEXT.JS FRONTEND                              │
│  (Landing / Dashboard / Document Workspace / Assistant / Settings)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / JSON
                                    │ (JWT Bearer Auth)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         FASTAPI BACKEND                                │
│                                                                        │
│  ├── Auth Router        (/api/auth/signup, /login, /me)                │
│  ├── Document Router    (/api/documents/upload, list, detail, delete)  │
│  ├── Analysis Router    (/api/documents/{id}/analyze, /summary)        │
│  ├── Chat Router        (/api/documents/{id}/chat)                     │
│  └── Dashboard Router   (/api/dashboard/stats)                         │
└──────────┬────────────────────────┬────────────────────────┬───────────┘
           │                        │                        │
           ▼                        ▼                        ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│  EXTRACTION SERVICE  │ │     DATABASE LAYER   │ │   AI SERVICE LAYER   │
│                      │ │                      │ │                      │
│ • pypdf / pdfplumber │ │ • SQLAlchemy ORM     │ │ • BaseAIProvider     │
│ • PIL / Image OCR    │ │ • PostgreSQL         │ │ • GeminiProvider     │
│ • Page-level split   │ │   (or SQLite for dev)│ │   (gemini-1.5-flash) │
│                      │ │ • Strict User Scopes │ │ • Fallback Provider  │
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘
```

### End-to-End Data Pipeline

```
USER UPLOAD
    │
    ▼
FastAPI (/api/documents/upload)
    │
    ├─► Validates MIME type & size (<10MB)
    ├─► Stores physical file securely on disk
    ├─► Creates Document row (status: "processing")
    │
    ▼
ExtractionService
    │
    ├─► Extracts text page-by-page: [{"page": 1, "text": "..."}, ...]
    └─► Updates document record with extracted text
    │
    ▼
AIService (GeminiProvider)
    │
    ├─► summarize_document() ──► Generates summary + key takeaways
    ├─► extract_information() ──► Extracts structured JSON entities
    └─► Saves DocumentAnalysis in database (status: "ready")
    │
    ▼
USER ASKS QUESTION
    │
    ▼
FastAPI (/api/documents/{id}/chat)
    │
    ▼
AIService.answer_question(question, document_pages)
    │
    ├─► Strict grounding prompt sent to Gemini API
    ├─► Returns JSON: {"answer": "...", "sources": [{"page": 2, "text": "..."}]}
    ├─► Persists to ChatSession & ChatMessage models
    │
    ▼
FRONTEND WORKSPACE
    │
    ├─► Renders Answer block
    ├─► Renders interactive SourceReference cards
    └─► User clicks "View source" ──► Viewer navigates to page & highlights text
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS with custom editorial design tokens
- **Icons**: Lucide React
- **HTTP Client**: Centralized typed API client (`frontend/lib/api.ts`)

### Backend
- **Framework**: FastAPI (Python 3.12)
- **ASGI Server**: Uvicorn
- **Validation**: Pydantic v2 & Pydantic Settings
- **ORM / Database**: SQLAlchemy 2.0 with PostgreSQL (`psycopg2-binary`) & SQLite fallback
- **Auth**: PyJWT & passlib (bcrypt)
- **Document Processing**: `pypdf`, `pdfplumber`, `Pillow`
- **AI SDK**: Google GenAI / Google Generative AI SDK

---

## Directory Structure

```
proofline/
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Editorial Landing Page
│   │   ├── login/page.tsx        # Authentication: Login
│   │   ├── signup/page.tsx       # Authentication: Signup
│   │   ├── dashboard/page.tsx    # Workspace: Recent documents & upload
│   │   ├── documents/
│   │   │   ├── page.tsx          # Document repository (search, filter, sort)
│   │   │   └── [id]/page.tsx     # 3-column verification workspace
│   │   ├── assistant/page.tsx    # Cross-document Q&A assistant
│   │   ├── settings/page.tsx     # User profile and security settings
│   │   ├── layout.tsx            # Global layout with responsive navbar
│   │   └── globals.css           # Custom design system styles & font setup
│   ├── components/
│   │   ├── DocumentViewer.tsx    # Multi-page viewer with zoom, search & highlights
│   │   ├── DocumentTable.tsx     # Filterable document list
│   │   ├── DocumentStatus.tsx    # Visual status badges
│   │   ├── UploadPanel.tsx       # Drag-and-drop & "Try sample document"
│   │   ├── ProcessingTimeline.tsx# 5-stage progress indicator
│   │   ├── ExtractedFields.tsx   # Structured entity cards (amounts, dates, etc.)
│   │   ├── SourceReference.tsx   # Grounded citation card with "View source"
│   │   ├── SourceHighlight.tsx   # Visual indicator on relevant text/page
│   │   ├── SummaryPanel.tsx      # Executive summary & key points
│   │   ├── QuestionInput.tsx     # Suggested queries + text input
│   │   ├── AnswerBlock.tsx       # AI answer display with confidence
│   │   ├── ChatHistory.tsx       # Question and answer history list
│   │   ├── WorkspaceHeader.tsx   # Document title, status, actions
│   │   └── ResponsiveNavigation.tsx # Navigation for desktop & mobile
│   ├── lib/
│   │   ├── api.ts                # Centralized typed API layer
│   │   └── utils.ts              # Formatting & helper functions
│   ├── hooks/
│   │   └── useAuth.ts            # Authentication hook with persistence
│   ├── types/
│   │   └── index.ts              # Shared TypeScript definitions
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI application entry point
│   │   ├── config.py             # App settings (Pydantic)
│   │   ├── database.py           # Database connection & session factory
│   │   ├── models/               # SQLAlchemy models
│   │   │   ├── user.py           # User model
│   │   │   ├── document.py       # Document model
│   │   │   ├── analysis.py       # DocumentAnalysis model
│   │   │   └── chat.py           # ChatSession & ChatMessage models
│   │   ├── schemas/              # Pydantic schemas
│   │   │   ├── auth.py
│   │   │   ├── document.py
│   │   │   ├── analysis.py
│   │   │   └── chat.py
│   │   ├── api/                  # API routes
│   │   │   ├── auth.py
│   │   │   ├── documents.py
│   │   │   ├── analysis.py
│   │   │   ├── chat.py
│   │   │   └── dashboard.py
│   │   ├── services/             # Business logic layer
│   │   │   ├── auth_service.py
│   │   │   ├── document_service.py
│   │   │   ├── extraction_service.py
│   │   │   └── ocr_service.py
│   │   └── ai/                   # AI Abstraction Layer
│   │       ├── base.py           # Base provider interface
│   │       ├── gemini_provider.py# Google Gemini API implementation
│   │       ├── local_provider.py # Grounded fallback provider
│   │       └── service.py        # AIService orchestrator
│   └── requirements.txt
│
├── sample_data/
│   └── sample_invoice.pdf        # Test invoice (INV-2026-1042, ₹45,000)
├── .env.example                  # Environment variable reference
├── .gitignore                    # Git ignore file
├── README.md                     # This documentation
├── ARCHITECTURE.md               # Detailed architectural blueprint
└── DESIGN.md                     # Editorial design system specifications
```

---

## System Requirements

- **Operating System**: Windows 10/11 (Native, PowerShell — no WSL required)
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Python**: Python 3.10 to 3.12 (Python 3.12 installed)
- **Database**: PostgreSQL (recommended for production) or SQLite (ready out-of-the-box for local testing)

---

## Quick Start (Windows Native)

Follow these steps in PowerShell to get Proofline running locally.

### 1. Environment Configuration

Copy `.env.example` to `backend/.env` and `frontend/.env.local`:

```powershell
# Copy environment template to backend
Copy-Item .env.example backend\.env
```

Edit `backend\.env`:
```ini
# Application Secret (change in production)
JWT_SECRET=proofline_super_secret_jwt_key_2026_dev_mode
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database URL
# For PostgreSQL:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/proofline
# For SQLite (default out-of-the-box on Windows):
DATABASE_URL=sqlite:///./proofline.db

# AI Provider Configuration
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# CORS Origins
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

---

### 2. Database Setup (PostgreSQL / SQLite)

- **Option A (Zero Setup — SQLite)**: Leave `DATABASE_URL=sqlite:///./proofline.db`. The application will automatically create the SQLite database file on startup with full foreign-key support and WAL mode.
- **Option B (PostgreSQL)**: If you have PostgreSQL installed:
  ```powershell
  # Using psql in PowerShell:
  psql -U postgres -c "CREATE DATABASE proofline;"
  ```
  Then set `DATABASE_URL=postgresql://postgres:your_password@localhost:5432/proofline` in `backend\.env`.

---

### 3. Backend Setup

Open a PowerShell terminal and navigate to the backend directory:

```powershell
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\Activate.ps1

# Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Start the FastAPI server with auto-reload
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend server will start at: `http://127.0.0.1:8000`
- Interactive API Docs (Swagger UI): `http://127.0.0.1:8000/docs`
- Alternative Docs (ReDoc): `http://127.0.0.1:8000/redoc`

---

### 4. Frontend Setup

Open a second PowerShell terminal:

```powershell
cd frontend

# Install Node dependencies (using npm.cmd on Windows)
npm.cmd install

# Start the Next.js development server
npm.cmd run dev
```

The frontend application will start at: `http://localhost:3000`

---

## Google Gemini AI Integration

Proofline integrates with Google Gemini to perform document summarization, entity extraction, and grounded Q&A.

### Obtaining an API Key
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Create an API Key.
3. Add it to `backend/.env`:
   ```ini
   GEMINI_API_KEY=AIzaSy...
   AI_PROVIDER=gemini
   ```

### Strict Grounding & Source Citations
The backend uses a strict grounding prompt preventing hallucination:
> *"You are answering questions about an uploaded document. Use ONLY the supplied document context. Do not invent facts. If the information cannot be found in the document, say: 'I couldn't find that information in the uploaded document.' When possible, provide the relevant source passage and page."*

The AI returns responses conforming to this schema:
```json
{
  "answer": "The total amount payable under this invoice is ₹45,000.",
  "sources": [
    {
      "page": 1,
      "text": "Total Amount: ₹45,000 (Due Date: 17 Oct 2026)"
    }
  ]
}
```

*Note: If no API key is set during initial testing, Proofline's intelligent local provider provides deterministic, grounded responses for sample invoices and documents so the platform remains 100% functional for evaluation.*

---

## API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user (name, email, password) | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT bearer token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |

### Documents (`/api/documents`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/documents/upload` | Upload PDF or image (max 10MB) | Yes |
| `GET` | `/api/documents` | List user's documents (with search/filter) | Yes |
| `GET` | `/api/documents/{id}` | Get document metadata & extracted text | Yes |
| `DELETE` | `/api/documents/{id}` | Delete document and associated data | Yes |
| `GET` | `/api/documents/{id}/file` | Stream raw document file | Yes |

### Analysis (`/api/documents/{id}/...`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/documents/{id}/analyze` | Trigger full AI analysis & entity extraction | Yes |
| `POST` | `/api/documents/{id}/summary` | Regenerate executive summary & key takeaways | Yes |

### Live Chat & Q&A (`/api/documents/{id}/chat`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/documents/{id}/chat` | Ask grounded question about document | Yes |
| `GET` | `/api/documents/{id}/chat` | Fetch chat history with source citations | Yes |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Document counts, status breakdown, recent items | Yes |

---

## End-to-End Demo Workflow

To verify all requirements end-to-end:

1. **Visit Landing Page**:
   - Navigate to `http://localhost:3000`.
   - Review the verified answers hero section and click **"Open workspace"**.
2. **Sign Up**:
   - Create a new account with your name, email, and password.
   - Automatically redirected to `/dashboard`.
3. **Upload Document**:
   - In `/dashboard`, click **"+ Upload document"**.
   - Either drag a PDF/image or click **"Try sample document (sample_invoice.pdf)"** for 1-click test document ingestion.
   - Watch the 5-stage progress timeline: `Uploading` → `Reading` → `Extracting` → `Analyzing` → `Ready`.
4. **Inspect the 3-Column Verification Workspace**:
   - **Panel 1 (Viewer)**: Browse pages, zoom in/out, and search text.
   - **Panel 2 (Extracted Content)**: Inspect structured fields (`Invoice Number: INV-2026-1042`, `Total Amount: ₹45,000`, `Issued: 17 Sep 2026`, `Organization: Example Pvt Ltd`).
   - **Panel 3 (AI Analysis & Q&A)**: Read the executive summary.
5. **Live AI Q&A with Verification**:
   - Click a suggested question like **"What is the total amount?"** or type a custom question.
   - View the grounded AI answer: *"The total amount is ₹45,000."*
   - Observe the source citation card: `Page 1` with the exact snippet.
   - Click **"View source"** — the document viewer scrolls to the exact page and highlights the text!
6. **Cross-Document Assistant**:
   - Navigate to `/assistant` to select documents and ask multi-query verification questions.
7. **Document Management & Isolation**:
   - Go to `/documents` to filter, search, and delete documents.
   - Logout from `/settings` to verify protected route enforcement.

---

## Troubleshooting & Windows Tips

### 1. PowerShell Script Execution Policy
If `Activate.ps1` gives a script execution error:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Or run python directly:
```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

### 2. npm.ps1 Execution Policy Error
In PowerShell, running `npm` might attempt to execute `npm.ps1`. Always use:
```powershell
npm.cmd install
npm.cmd run dev
```

### 3. Python 3.12 Location
If `python` is not in your global PATH, run using the installed binary:
```powershell
& 'C:\Users\UtkarshRaj\AppData\Local\Programs\Python\Python312\python.exe' -m venv venv
```

### 4. CORS Issues
Ensure `ALLOWED_ORIGINS` in `backend/.env` contains your frontend URL (`http://localhost:3000`).

---

## License

MIT License. Developed for Proofline document intelligence and verification.
