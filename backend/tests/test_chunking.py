import pytest
from app.services.documents import chunk_text, tokenize, extract_topics


def test_chunk_text_basic():
    sample_text = "This is sentence one. " * 50
    chunks = chunk_text(sample_text, chunk_size=200, overlap=50)
    assert len(chunks) > 1
    assert all(len(c) <= 200 for c in chunks)


def test_chunk_text_empty():
    assert chunk_text("") == []
    assert chunk_text("   \n\t   ") == []


def test_chunk_text_overlap():
    text = "Word " * 100
    chunks = chunk_text(text, chunk_size=100, overlap=30)
    assert len(chunks) >= 2


def test_tokenize():
    text = "The fast AI agent processed 100 documents and analyzed vectors."
    tokens = tokenize(text)
    assert "agent" in tokens
    assert "processed" in tokens
    assert "the" not in tokens  # Stopword removed


def test_extract_topics():
    text = "machine learning machine learning model neural network training data model machine learning"
    topics = extract_topics(text, limit=3)
    assert "machine" in topics or "learning" in topics or "model" in topics
