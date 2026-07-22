from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import UPLOAD_DIR
from app.models.schemas import (
    AgentResearchRequest,
    AgentResearchResponse,
    AskRequest,
    AskResponse,
    CompareRequest,
    CompareResponse,
    DocumentSummary,
    QuizRequest,
    QuizResponse,
    SummaryRequest,
    SummaryResponse,
    TopicsResponse,
    UploadResponse,
)
from app.services.agent import ResearchAgent
from app.services.documents import (
    DocumentStore,
    build_comparison,
    extract_text_from_pdf,
    extract_topics,
)
from app.services.rag import build_answer, build_quiz, build_summary

router = APIRouter(prefix="/api", tags=["documents"])
store = DocumentStore()
agent = ResearchAgent(store)


@router.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "embedding_provider": store.embedding_provider,
        "agent_status": "ready",
    }


@router.get("/documents", response_model=list[DocumentSummary])
def list_documents() -> list[dict]:
    return store.list()


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)) -> UploadResponse:
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    destination = UPLOAD_DIR / file.filename
    file_bytes = await file.read()
    destination.write_bytes(file_bytes)

    try:
        text, page_count = extract_text_from_pdf(destination)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {exc}") from exc

    if not text.strip():
        raise HTTPException(status_code=400, detail="Extracted text from PDF is empty. The PDF may be scanned or empty.")

    document = store.add(file.filename, destination, text, page_count)
    return UploadResponse(
        document_id=document.document_id,
        filename=document.filename,
        page_count=document.page_count,
        chunk_count=len(document.chunks),
    )


@router.post("/ask", response_model=AskResponse)
def ask_question(request: AskRequest) -> AskResponse:
    document = _resolve_document(request.document_id)
    context_chunks = store.search_chunks(document.document_id, request.question, limit=4)
    payload = build_answer(request.question, document, context_chunks=context_chunks)
    return AskResponse(
        document_id=document.document_id,
        embedding_provider=store.embedding_provider,
        **payload,
    )


@router.post("/agent/research", response_model=AgentResearchResponse)
def run_research_agent(request: AgentResearchRequest) -> AgentResearchResponse:
    return agent.run_research(
        goal=request.goal,
        document_id=request.document_id,
        max_steps=request.max_steps,
    )


@router.post("/summarize", response_model=SummaryResponse)
def summarize_document(request: SummaryRequest) -> SummaryResponse:
    document = _resolve_document(request.document_id)
    summary = build_summary(document, style=request.style)
    return SummaryResponse(summary=summary, document_id=document.document_id)


@router.post("/quiz", response_model=QuizResponse)
def generate_quiz(request: QuizRequest) -> QuizResponse:
    document = _resolve_document(request.document_id)
    items = build_quiz(document, count=request.count)
    return QuizResponse(items=items, document_id=document.document_id)


@router.post("/topics", response_model=TopicsResponse)
def get_topics(request: SummaryRequest) -> TopicsResponse:
    document = _resolve_document(request.document_id)
    topics = extract_topics(document.text)
    return TopicsResponse(topics=topics, document_id=document.document_id)


@router.post("/compare", response_model=CompareResponse)
def compare_documents(request: CompareRequest) -> CompareResponse:
    documents = store.get_many(request.document_ids)
    comparison = build_comparison(documents)
    return CompareResponse(comparison=comparison, document_ids=request.document_ids)


def _resolve_document(document_id: str | None):
    try:
        if document_id:
            return store.get(document_id)
        return store.latest()
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
