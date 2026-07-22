import pytest
from app.services.documents import StoredDocument
from app.services.rag import build_answer, build_summary, build_quiz


@pytest.fixture
def mock_document():
    return StoredDocument(
        document_id="doc-test-123",
        filename="test_paper.pdf",
        path="/tmp/test_paper.pdf",
        text="Retrieval-Augmented Generation (RAG) combines semantic vector retrieval with large language models.",
        chunks=[
            "Retrieval-Augmented Generation (RAG) combines semantic vector retrieval with large language models.",
            "Vector databases like ChromaDB store high-dimensional embeddings efficiently.",
        ],
        page_count=2,
        created_at="2026-07-22T10:00:00Z",
    )


def test_build_answer(mock_document):
    res = build_answer(question="What is RAG?", document=mock_document)
    assert "answer" in res
    assert "sources" in res
    assert res["confidence_score"] > 0
    assert len(res["sources"]) > 0


def test_build_summary_bullet(mock_document):
    summary = build_summary(document=mock_document, style="bullet")
    assert isinstance(summary, str)
    assert len(summary) > 0


def test_build_summary_executive(mock_document):
    summary = build_summary(document=mock_document, style="executive")
    assert "Executive Summary" in summary


def test_build_quiz(mock_document):
    quiz = build_quiz(document=mock_document, count=3)
    assert len(quiz) == 3
    assert "question" in quiz[0]
    assert len(quiz[0]["options"]) == 4
