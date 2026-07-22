import pytest
from app.prompts.qa_prompt import QA_SYSTEM_PROMPT, render_qa_prompt
from app.prompts.summary_prompt import SUMMARY_SYSTEM_PROMPT, render_summary_prompt
from app.prompts.quiz_prompt import QUIZ_SYSTEM_PROMPT, render_quiz_prompt
from app.prompts.agent_prompt import AGENT_REACT_PROMPT, render_agent_prompt


def test_qa_prompt_rendering():
    prompt = render_qa_prompt(
        question="What is ChromaDB?",
        filename="vector_db.pdf",
        context_chunks=["ChromaDB is an open-source vector database for AI apps."]
    )
    assert "What is ChromaDB?" in prompt
    assert "vector_db.pdf" in prompt
    assert "[Chunk 1]:" in prompt
    assert "ChromaDB is an open-source vector database" in prompt


def test_summary_prompt_rendering():
    prompt = render_summary_prompt(
        filename="paper.pdf",
        style="bullet",
        content="Research paper contents on deep learning."
    )
    assert "paper.pdf" in prompt
    assert "bullet" in prompt
    assert "Research paper contents" in prompt


def test_quiz_prompt_rendering():
    prompt = render_quiz_prompt(
        filename="quiz_doc.pdf",
        count=5,
        content="Content for generating quiz items."
    )
    assert "quiz_doc.pdf" in prompt
    assert "5" in prompt


def test_agent_prompt_rendering():
    prompt = render_agent_prompt(
        goal="Investigate transformer attention mechanisms",
        available_docs="attention.pdf (5 pages)"
    )
    assert "Investigate transformer attention mechanisms" in prompt
    assert "attention.pdf" in prompt
    assert "AVAILABLE TOOLS:" in prompt
