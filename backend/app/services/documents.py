from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
import re
import uuid

from pypdf import PdfReader

STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "have",
    "he",
    "in",
    "is",
    "it",
    "its",
    "of",
    "on",
    "or",
    "that",
    "the",
    "their",
    "they",
    "this",
    "to",
    "was",
    "were",
    "will",
    "with",
    "you",
    "your",
}


@dataclass
class StoredDocument:
    document_id: str
    filename: str
    path: str
    text: str
    chunks: list[str]
    page_count: int
    created_at: str

    def to_summary(self) -> dict:
        return {
            "document_id": self.document_id,
            "filename": self.filename,
            "page_count": self.page_count,
            "chunk_count": len(self.chunks),
            "created_at": self.created_at,
        }


class DocumentStore:
    def __init__(self) -> None:
        self._documents: dict[str, StoredDocument] = {}

    def add(self, filename: str, file_path: Path, text: str, page_count: int) -> StoredDocument:
        document_id = str(uuid.uuid4())
        document = StoredDocument(
            document_id=document_id,
            filename=filename,
            path=str(file_path),
            text=text,
            chunks=chunk_text(text),
            page_count=page_count,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        self._documents[document_id] = document
        return document

    def list(self) -> list[dict]:
        return [document.to_summary() for document in self._documents.values()]

    def get(self, document_id: str) -> StoredDocument:
        if document_id not in self._documents:
            raise KeyError(f"Unknown document_id: {document_id}")
        return self._documents[document_id]

    def get_many(self, document_ids: list[str]) -> list[StoredDocument]:
        return [self.get(document_id) for document_id in document_ids]

    def latest(self) -> StoredDocument:
        if not self._documents:
            raise KeyError("No documents have been uploaded yet.")
        return list(self._documents.values())[-1]


def extract_text_from_pdf(file_path: Path) -> tuple[str, int]:
    reader = PdfReader(str(file_path))
    pages: list[str] = []
    for page in reader.pages:
        extracted = page.extract_text() or ""
        pages.append(extracted.strip())
    text = "\n\n".join(page for page in pages if page)
    return text.strip(), len(reader.pages)


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    normalized = re.sub(r"\s+", " ", text).strip()
    if not normalized:
        return []

    chunks: list[str] = []
    start = 0
    text_length = len(normalized)
    while start < text_length:
        end = min(start + chunk_size, text_length)
        chunk = normalized[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == text_length:
            break
        start = max(end - overlap, start + 1)
    return chunks


def tokenize(text: str) -> list[str]:
    return [token for token in re.findall(r"[a-zA-Z0-9']+", text.lower()) if token not in STOPWORDS]


def rank_chunks(question: str, chunks: list[str], limit: int = 4) -> list[str]:
    question_tokens = set(tokenize(question))
    scored: list[tuple[int, int, str]] = []
    for index, chunk in enumerate(chunks):
        chunk_tokens = set(tokenize(chunk))
        overlap = len(question_tokens & chunk_tokens)
        if overlap:
            scored.append((overlap, -len(chunk), chunk))
    if not scored:
        return chunks[:limit]
    scored.sort(reverse=True)
    return [chunk for _, _, chunk in scored[:limit]]


def extract_topics(text: str, limit: int = 8) -> list[str]:
    words = [word for word in tokenize(text) if len(word) > 3]
    most_common = Counter(words).most_common(limit * 2)
    topics: list[str] = []
    for word, _ in most_common:
        if word not in topics:
            topics.append(word.replace("_", " "))
        if len(topics) == limit:
            break
    return topics


def build_comparison(documents: list[StoredDocument]) -> str:
    if len(documents) < 2:
        return "At least two documents are required for comparison."

    all_topics = [set(extract_topics(document.text, limit=10)) for document in documents]
    common_topics = sorted(set.intersection(*all_topics)) if all_topics else []
    unique_topics = [sorted(topics - set(common_topics)) for topics in all_topics]

    parts = ["Comparison summary:"]
    parts.append(f"Common topics: {', '.join(common_topics) if common_topics else 'None detected'}.")
    for document, topics in zip(documents, unique_topics, strict=False):
        parts.append(
            f"{document.filename}: {'; '.join(topics[:6]) if topics else 'No strong unique terms detected.'}"
        )
    return "\n".join(parts)


def serialize_document(document: StoredDocument) -> dict:
    return asdict(document)
