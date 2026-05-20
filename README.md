# AI Research Assistant

A practical starter for building PDF-centered research assistants using a FastAPI backend and a React + Vite frontend. Upload documents, run question answering with citations, generate summaries and quizzes, and compare documents.

**Repository:** d:/AI-Research-Assistant

**Quick summary:** FastAPI API + React UI, local-first document store with optional vectorization via ChromaDB and LLM integrations (OpenAI / Groq).

**Primary goals:**
- Ingest PDFs and extract text
- Provide a conversational QA and summarization interface
- Generate quizzes and topic extractions for study workflows
- Offer a minimal RAG-ready code surface for extensions

**Contents of this README**
- Project overview and tech stack
- Quickstart (local dev)
- Environment variables
- Project structure and important files
- API reference (high level)
- Deployment notes and next steps

**Tech Stack**
- **Backend:** Python, FastAPI, Uvicorn, Pydantic
- **Frontend:** React 18, Vite, React Router
- **Styling & UI:** Custom CSS + Lucide React icons
- **HTTP / Client:** Axios
- **PDF processing:** pypdf
- **Vector store (optional):** ChromaDB
- **Embeddings / Models:** sentence-transformers, OpenAI (or other LLM providers)
- **RAG helpers:** LangChain, LangGraph (optional integration)

Useful dependency sources:
- See backend dependencies: [backend/requirements.txt](backend/requirements.txt)
- See frontend deps: [frontend/package.json](frontend/package.json)

---

**Quickstart — Run locally**

Prereqs: Python 3.10+, Node.js 18+, npm

1) Backend (Windows PowerShell)

```powershell
cd backend
python -m venv .venv
.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Or on macOS / Linux:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open the app at http://127.0.0.1:5173 (Vite default).

---

Environment variables
- Backend: copy and fill [backend/.env.example](backend/.env.example) or create `.env` in `backend/`:

```env
OPENAI_API_KEY=your_openai_key
# Optional: GROQ_API_KEY, CHROMA settings, etc.
```

- Frontend: set `VITE_API_BASE_URL` in `frontend/.env` (used by the SPA to connect to the backend):

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

Project structure (key files)
- **backend/** — FastAPI app and services
  - [backend/app/main.py](backend/app/main.py) — FastAPI entrypoint
  - [backend/app/api/routes.py](backend/app/api/routes.py) — API routes
  - [backend/app/services/documents.py](backend/app/services/documents.py) — upload + retrieval helpers
  - [backend/requirements.txt](backend/requirements.txt) — Python dependencies

- **frontend/** — React + Vite SPA
  - [frontend/src/main.jsx](frontend/src/main.jsx) — app entry
  - [frontend/src/App.jsx](frontend/src/App.jsx) — routes and layout
  - [frontend/src/pages/UploadPage.jsx](frontend/src/pages/UploadPage.jsx) — upload UX
  - [frontend/package.json](frontend/package.json) — npm scripts & deps

---

High-level API (examples)
- `GET /` — root info
- `GET /api/health` — health check
- `GET /api/documents` — list uploaded documents
- `POST /api/upload` — upload a PDF (multipart/form-data)
- `POST /api/ask` — question answering payload
- `POST /api/summarize` — request a summary
- `POST /api/quiz` — request quiz generation

(See [backend/app/api/routes.py](backend/app/api/routes.py) for exact schemas and usage.)

---

Deployment notes
- Quick suggestion: host the backend on Render / Railway and the frontend on Vercel. Ensure CORS origins in `backend/app/core/config.py` allow your deployed frontend domain.
- Update `VITE_API_BASE_URL` in the frontend production env to point to your backend.

---

Contributing
- Open issues for bugs or feature requests
- PRs should include tests where applicable and be scoped to a single feature

---

License & contact
- Add a `LICENSE` file to the repo if you intend to open-source this project.
- Questions: open an issue or reach out in the repository discussion.

---