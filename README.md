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

## Notes

- The current backend uses a lightweight retrieval fallback so the MVP works without extra infrastructure.
- The dependency list includes the packages needed to evolve this into a LangChain / LangGraph RAG stack.
