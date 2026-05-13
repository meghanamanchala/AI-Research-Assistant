# AI Research Assistant

A FastAPI + React starter for a multi-agent document research assistant.

## What is included

- PDF upload endpoint
- PDF text extraction and chunking
- Question answering with citation-style context snippets
- Summary, quiz, topics, and compare endpoints
- React + Vite frontend scaffold

## Project structure

```text
backend/
  app/
    core/
    routes/
    services/
frontend/
  src/
```

## Backend setup

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Create a local environment file from the example:

```powershell
Copy-Item .env.example .env
```

## Frontend setup

```powershell
cd frontend
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in `frontend/.env` if your backend is not running at `http://127.0.0.1:8000`.

## Next steps

- Replace the heuristic answer generation with your preferred LLM provider
- Swap the in-memory store for ChromaDB or another vector store
- Add LangGraph orchestration for summaries, quizzes, and human approval flows
