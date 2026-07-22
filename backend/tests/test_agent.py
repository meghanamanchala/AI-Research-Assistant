import pytest
from unittest.mock import MagicMock
from app.services.agent import ResearchAgent
from app.services.documents import StoredDocument


@pytest.fixture
def mock_store():
    store = MagicMock()
    mock_doc = StoredDocument(
        document_id="agent-doc-1",
        filename="agent_test.pdf",
        path="/tmp/agent_test.pdf",
        text="Autonomous agents execute multi-step ReAct loops to solve complex reasoning goals.",
        chunks=["Autonomous agents execute multi-step ReAct loops to solve complex reasoning goals."],
        page_count=1,
        created_at="2026-07-22T10:00:00Z",
    )
    store.list.return_value = [{"document_id": "agent-doc-1", "filename": "agent_test.pdf", "page_count": 1, "created_at": "2026-07-22"}]
    store.get.return_value = mock_doc
    store.latest.return_value = mock_doc
    store.search_chunks_with_metadata.return_value = [{
        "text": mock_doc.chunks[0],
        "document_id": mock_doc.document_id,
        "filename": mock_doc.filename,
        "chunk_index": 0,
        "distance": 0.1,
    }]
    return store


def test_research_agent_run(mock_store):
    agent = ResearchAgent(mock_store)
    response = agent.run_research(goal="How do autonomous agents execute reasoning?")
    
    assert response.goal == "How do autonomous agents execute reasoning?"
    assert len(response.thought_steps) >= 3
    assert "vector_search" in response.tools_used
    assert response.confidence_score > 0.5
    assert len(response.citations) > 0
    assert "ReAct loops" in response.answer
