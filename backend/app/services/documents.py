from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
import re
import uuid


# pyrefly: ignore [missing-import]
import chromadb
from app.core.config import CHROMA_DIR, EMBEDDING_PROVIDER, OPENAI_API_KEY

# pyrefly: ignore [missing-import]
from chromadb.utils.embedding_functions import (
    OpenAIEmbeddingFunction,
    SentenceTransformerEmbeddingFunction,
)
# pyrefly: ignore [missing-import]
from pypdf import PdfReader


def get_embedding_function():
    if EMBEDDING_PROVIDER == "openai" and OPENAI_API_KEY:
        return OpenAIEmbeddingFunction(api_key=OPENAI_API_KEY, model_name="text-embedding-3-small")
    return SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")


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
        self._client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        self._embedding_function = get_embedding_function()
        self.embedding_provider = "openai" if isinstance(self._embedding_function, OpenAIEmbeddingFunction) else "sentence-transformers"
        self._documents_collection = self._client.get_or_create_collection(
            name="uploaded_documents",
            embedding_function=self._embedding_function,
        )
        self._chunks_collection = self._client.get_or_create_collection(
            name="document_chunks",
            embedding_function=self._embedding_function,
        )

    def _document_from_payload(self, payload: dict) -> StoredDocument:
        metadata = payload["metadata"]
        return StoredDocument(
            document_id=metadata["document_id"],
            filename=metadata["filename"],
            path=metadata["path"],
            text=payload["text"],
            chunks=payload["chunks"],
            page_count=int(metadata["page_count"]),
            created_at=metadata["created_at"],
        )

    def _get_document_payload(self, document_id: str) -> dict:
        document_result = self._documents_collection.get(
            ids=[document_id],
            include=["documents", "metadatas"],
        )
        if not document_result.get("ids"):
            raise KeyError(f"Unknown document_id: {document_id}")

        chunk_result = self._chunks_collection.get(
            where={"document_id": document_id},
            include=["documents", "metadatas"],
        )
        paired_chunks = list(
            zip(
                chunk_result.get("documents", []),
                chunk_result.get("metadatas", []),
                strict=False,
            )
        )
        paired_chunks.sort(key=lambda item: int(item[1].get("chunk_index", 0)))
        chunks = [chunk for chunk, _ in paired_chunks if chunk]
        text = document_result.get("documents", [""])[0] or "\n\n".join(chunks)
        return {
            "metadata": document_result["metadatas"][0],
            "text": text,
            "chunks": chunks,
        }

    def add(self, filename: str, file_path: Path, text: str, page_count: int) -> StoredDocument:
        document_id = str(uuid.uuid4())
        chunks = chunk_text(text)
        created_at = datetime.now(timezone.utc).isoformat()
        metadata = {
            "document_id": document_id,
            "filename": filename,
            "path": str(file_path),
            "page_count": page_count,
            "chunk_count": len(chunks),
            "created_at": created_at,
        }

        self._documents_collection.add(
            ids=[document_id],
            documents=[text],
            metadatas=[metadata],
        )

        if chunks:
            self._chunks_collection.add(
                ids=[f"{document_id}:{index}" for index in range(len(chunks))],
                documents=chunks,
                metadatas=[
                    {
                        "document_id": document_id,
                        "filename": filename,
                        "path": str(file_path),
                        "page_count": page_count,
                        "created_at": created_at,
                        "chunk_index": index,
                    }
                    for index in range(len(chunks))
                ],
            )

        document = StoredDocument(
            document_id=document_id,
            filename=filename,
            path=str(file_path),
            text=text,
            chunks=chunks,
            page_count=page_count,
            created_at=created_at,
        )
        return document

    def list(self) -> list[dict]:
        document_result = self._documents_collection.get(include=["metadatas"])
        summaries: list[dict] = []
        for metadata in document_result.get("metadatas", []):
            if not metadata:
                continue
            summaries.append(
                {
                    "document_id": metadata["document_id"],
                    "filename": metadata["filename"],
                    "page_count": int(metadata["page_count"]),
                    "chunk_count": int(metadata.get("chunk_count", 0)),
                    "created_at": metadata["created_at"],
                }
            )
        summaries.sort(key=lambda item: item["created_at"], reverse=True)
        return summaries

    def get(self, document_id: str) -> StoredDocument:
        return self._document_from_payload(self._get_document_payload(document_id))

    def get_many(self, document_ids: list[str]) -> list[StoredDocument]:
        return [self.get(document_id) for document_id in document_ids]

    def latest(self) -> StoredDocument:
        documents = self.list()
        if not documents:
            raise KeyError("No documents have been uploaded yet.")
        return self.get(documents[0]["document_id"])

    def search_chunks(self, document_id: str | None, query: str, limit: int = 4) -> list[str]:
        where_clause = {"document_id": document_id} if document_id else None
        chunk_result = self._chunks_collection.query(
            query_texts=[query],
            n_results=limit,
            where=where_clause,
            include=["documents"],
        )
        documents = chunk_result.get("documents", [])
        if not documents:
            return []
        return [chunk for chunk in documents[0] if chunk]

    def search_chunks_with_metadata(
        self, query: str, document_id: str | None = None, limit: int = 4
    ) -> list[dict]:
        where_clause = {"document_id": document_id} if document_id else None
        chunk_result = self._chunks_collection.query(
            query_texts=[query],
            n_results=limit,
            where=where_clause,
            include=["documents", "metadatas", "distances"],
        )
        documents = chunk_result.get("documents", [[]])[0]
        metadatas = chunk_result.get("metadatas", [[]])[0]
        distances = chunk_result.get("distances", [[]])[0]

        results = []
        for idx in range(len(documents)):
            doc_text = documents[idx]
            meta = metadatas[idx] if idx < len(metadatas) else {}
            dist = distances[idx] if idx < len(distances) else 0.5
            results.append({
                "text": doc_text,
                "document_id": meta.get("document_id", document_id or ""),
                "filename": meta.get("filename", "document.pdf"),
                "chunk_index": meta.get("chunk_index", 0),
                "distance": dist,
            })
        return results



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
