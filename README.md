# AI Research Assistant

A practical starter for building PDF-centered research assistants using a FastAPI backend and a React + Vite frontend. Upload documents, run question answering with citations, generate summaries and quizzes, and compare documents.

**Repository:** d:/AI-Research-Assistant

**Quick summary:** FastAPI API + React UI, local-first document store with optional vectorization via ChromaDB and LLM integrations (OpenAI / Groq).

**Grounding and hallucination handling:** The system keeps answers anchored to the uploaded PDF content by retrieving only document-specific chunks, ranking them before generation, and returning source previews alongside the answer. When the retrieval step does not find relevant content, the API returns an explicit no-answer fallback instead of inventing details.

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
- **Vector store:** ChromaDB with persistent local storage in `backend/chroma_db/`
- **Embeddings / Models:** sentence-transformers, OpenAI (or other LLM providers)
- **RAG helpers:** LangChain, LangGraph (optional integration)

**How hallucinations are reduced**
- **Grounding strategy:** `/api/ask` resolves the target document, retrieves matching chunks from ChromaDB, and builds the answer from that context rather than from the model alone.
- **Retrieval filtering:** Chunk search is constrained to the selected document and only a small top-k set of the most relevant chunks is passed forward, which keeps the context focused and reduces drift.
- **Hallucination mitigation:** The answer payload includes source previews and the backend falls back to a clear "No relevant content was found" response when the document does not support a grounded answer.

**Chunking strategy and splitting details**
- **Default parameters:** The backend implements a sliding-window text splitter (see `backend/app/services/documents.py`) with a default chunk size of 1000 characters and an overlap of 200 characters. Text is normalized by collapsing whitespace before chunking.
- **Behavior:** The splitter takes the document text, produces contiguous chunks with the configured overlap to reduce information loss at chunk boundaries, and stores each chunk as a separate vector in ChromaDB. The API surfaces these chunks for retrieval and ranking during `/api/ask`.
- **Semantic splitting (optional):** The current implementation uses a fixed-size sliding window for simplicity and deterministic behavior. For better semantic coherence you can replace the splitter with a sentence- or semantic-aware text splitter (for example, LangChain's `RecursiveCharacterTextSplitter` with `separators` tuned to sentence boundaries, or a transformer-based sentence segmenter) to avoid cutting mid-sentence and to group semantically-related text.
- **Tradeoffs & recommendations:** Larger chunks keep more context but may introduce irrelevant material; smaller chunks are more focused but increase the number of vectors and retrieval cost. Overlap (e.g., 200 chars) helps preserve context across chunk borders. If your documents include dense, highly-interconnected content (research papers, legal text), prefer semantic/sentence-aware splitting; for general PDFs the default sliding window with modest overlap is a practical, low-dependency choice.

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

Document storage now persists through ChromaDB, so uploaded PDFs remain available after backend restarts and `/api/ask` uses semantic chunk retrieval from the local vector store.

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