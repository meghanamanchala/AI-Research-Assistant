# AI Research Assistant

A FastAPI + React starter for PDF-based research workflows: upload a document, ask questions against its contents, generate summaries and quizzes, and compare files.

## What is included

- FastAPI backend with PDF upload and retrieval endpoints
- React + Vite frontend with routed pages
- Upload, chat, summary, quiz, and compare flows
- Local-first document store with simple chunk retrieval
- Extension points for LangChain, LangGraph, ChromaDB, and LLM providers

## Project structure

- `backend/` FastAPI app and services
- `frontend/` React UI

## Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

## Frontend setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

## API endpoints

- `GET /` root
- `GET /api/health` health check
- `GET /api/documents` list uploaded documents
- `POST /api/upload` upload a PDF
- `POST /api/ask` ask a question
- `POST /api/summarize` generate a summary
- `POST /api/quiz` generate quiz items
- `POST /api/topics` extract topics
- `POST /api/compare` compare documents

## Deployment

### Quick Deploy (Recommended)

**Backend** → Render | **Frontend** → Vercel

1. Push to GitHub
2. Deploy backend to Render (auto-redeploy on push)
3. Deploy frontend to Vercel (auto-redeploy on push)
4. Update CORS origins between services

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.

### Environment Variables

**Backend (.env)**
```env
OPENAI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

**Frontend (.env.production)**
```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

## Live Demo

- Frontend: https://ai-research-assistant.vercel.app (update with your URL)
- Backend API: https://ai-research-assistant-backend.onrender.com (update with your URL)

## Features

- ✅ PDF upload and parsing
- ✅ Question answering with source citations
- ✅ Automatic summarization
- ✅ Quiz generation
- ✅ Document comparison
- ✅ Topic extraction
- ✅ Professional UI with Lucide icons
- ✅ Responsive design (mobile + desktop)
- ✅ Light theme, minimal aesthetic

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | FastAPI, Uvicorn, Pydantic |
| **Frontend** | React 18, Vite, React Router |
| **Styling** | Custom CSS, Lucide React Icons |
| **HTTP** | Axios |
| **PDF Processing** | PyPDF |
| **Vector Store** | ChromaDB (installed, optional) |
| **LLM** | OpenAI / Groq (optional) |
| **Deployment** | Render + Vercel |

## Architecture

```
User Browser (Vercel)
    ↓
React Frontend
    ↓ (CORS-enabled)
FastAPI Backend (Render)
    ↓
Document Store (in-memory)
    ↓
Chunk Retriever
    ↓
LLM Response (optional)
```

## Development

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup.

### Run Locally

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate   # Mac/Linux
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open http://127.0.0.1:5173

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist
- Backend API docs: http://localhost:8000/docs

## Notes

- The current backend uses a lightweight retrieval fallback so the MVP works without extra infrastructure.
- The dependency list includes the packages needed to evolve this into a LangChain / LangGraph RAG stack.
