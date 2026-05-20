from __future__ import annotations

from textwrap import shorten

from app.core.config import DEFAULT_LLM_MODEL, GROQ_API_KEY, OPENAI_API_KEY
from app.services.documents import StoredDocument, extract_topics, rank_chunks


def _join_context(chunks: list[str]) -> str:
    return "\n\n".join(f"- {chunk}" for chunk in chunks)


def build_answer(question: str, document: StoredDocument, context_chunks: list[str] | None = None) -> dict:
    context_chunks = context_chunks or rank_chunks(question, document.chunks, limit=4)
    answer = _fallback_answer(question, context_chunks)
    return {
        "answer": answer,
        "sources": [
            {
                "document_id": document.document_id,
                "filename": document.filename,
                "chunk_preview": shorten(chunk, width=220, placeholder="...")
            }
            for chunk in context_chunks
        ],
        "context": context_chunks,
    }


def build_summary(document: StoredDocument, style: str = "bullet") -> str:
    topics = extract_topics(document.text, limit=8)
    chunks = rank_chunks("summary", document.chunks, limit=4)
    if style == "paragraph":
        intro = f"This document focuses on {', '.join(topics[:5]) if topics else 'the uploaded material'}."
        body = " ".join(shorten(chunk, width=260, placeholder="...") for chunk in chunks)
        return f"{intro} {body}".strip()

    bullets = [f"- {topic.title()}" for topic in topics[:8]]
    bullets.extend(f"- {shorten(chunk, width=120, placeholder='...')}" for chunk in chunks[:4])
    return "\n".join(bullets)


def build_quiz(document: StoredDocument, count: int = 5) -> list[dict]:
    topics = extract_topics(document.text, limit=max(5, count))
    chunks = rank_chunks("quiz", document.chunks, limit=count)
    items: list[dict] = []
    for index in range(count):
        topic = topics[index % len(topics)] if topics else f"Concept {index + 1}"
        chunk = chunks[index % len(chunks)] if chunks else document.text
        answer = topic.title()
        items.append(
            {
                "question": f"Which concept is most closely associated with {topic}?",
                "options": [
                    answer,
                    "General overview",
                    "Irrelevant detail",
                    "Unrelated topic",
                ],
                "answer": answer,
                "source": shorten(chunk, width=180, placeholder="..."),
            }
        )
    return items


def _fallback_answer(question: str, context_chunks: list[str]) -> str:
    if not context_chunks:
        return "No relevant content was found in the uploaded document."

    context = _join_context(context_chunks)
    model_hint = DEFAULT_LLM_MODEL if OPENAI_API_KEY or GROQ_API_KEY else "local fallback"
    return (
        f"Answer draft using {model_hint}: {shorten(question, width=120, placeholder='...')}\n\n"
        f"Relevant context:\n{context}"
    )
