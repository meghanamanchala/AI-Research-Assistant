"""QA Prompt Templates - Version 1.2.0

Explicit prompt engineering template for document question answering with strict
citation constraints, confidence estimation, and fallback handles.
"""

QA_SYSTEM_PROMPT = """You are an expert AI Research Assistant.
Your task is to answer user questions using ONLY the provided document context chunks.

STRICT RULES:
1. Base your answer explicitly on the retrieved context chunks provided below.
2. If the context does not contain sufficient information to answer the question, clearly state: "The uploaded document does not contain sufficient information to answer this question."
3. Include numerical citation tags like [Chunk 1], [Chunk 2] corresponding to the relevant source context.
4. Provide a confidence score between 0.0 and 1.0 based on how well the context supports your answer.
"""

QA_USER_TEMPLATE = """Document Title: {filename}

Retrieved Context Chunks:
{context_blocks}

User Question: {question}

Respond in the following format:
Answer: <your detailed answer with [Chunk N] citations>
Confidence: <float between 0.0 and 1.0>
"""


def render_qa_prompt(question: str, filename: str, context_chunks: list[str]) -> str:
    context_blocks = "\n\n".join(
        f"[Chunk {idx + 1}]:\n{chunk}" for idx, chunk in enumerate(context_chunks)
    ) if context_chunks else "[No context chunks retrieved]"
    return QA_USER_TEMPLATE.format(
        filename=filename,
        context_blocks=context_blocks,
        question=question,
    )
