"""Quiz Prompt Templates - Version 1.0.0

Prompt template for generating multiple-choice comprehension questions with explicit key answers and source attribution.
"""

QUIZ_SYSTEM_PROMPT = """You are an educational content creator generating comprehension quizzes from technical/research documents.
Generate multiple-choice questions with 4 distinct options (1 correct answer, 3 plausible distractors) based on the document text.
"""

QUIZ_USER_TEMPLATE = """Document Title: {filename}
Target Questions Count: {count}

Document Context:
{content}

Format output as a valid JSON array of objects, where each object has:
- "question": string
- "options": list of 4 strings
- "answer": string (matching one of options)
- "source": string (brief source snippet from context)
"""


def render_quiz_prompt(filename: str, count: int, content: str) -> str:
    return QUIZ_USER_TEMPLATE.format(
        filename=filename,
        count=count,
        content=content,
    )
