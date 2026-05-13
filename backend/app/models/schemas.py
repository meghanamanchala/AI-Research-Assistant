from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class UploadResponse(BaseModel):
    document_id: str
    filename: str
    page_count: int
    chunk_count: int


class DocumentSummary(BaseModel):
    document_id: str
    filename: str
    page_count: int
    chunk_count: int
    created_at: str


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)
    document_id: str | None = None


class AskResponse(BaseModel):
    answer: str
    sources: list[dict]
    context: list[str]
    document_id: str | None = None


class SummaryRequest(BaseModel):
    document_id: str | None = None
    style: Literal["bullet", "paragraph"] = "bullet"


class SummaryResponse(BaseModel):
    summary: str
    document_id: str | None = None


class QuizRequest(BaseModel):
    document_id: str | None = None
    count: int = Field(default=5, ge=1, le=20)


class QuizItem(BaseModel):
    question: str
    options: list[str]
    answer: str


class QuizResponse(BaseModel):
    items: list[QuizItem]
    document_id: str | None = None


class TopicsResponse(BaseModel):
    topics: list[str]
    document_id: str | None = None


class CompareRequest(BaseModel):
    document_ids: list[str] = Field(min_length=2)


class CompareResponse(BaseModel):
    comparison: str
    document_ids: list[str]
