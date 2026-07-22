"""Summary Prompt Templates - Version 1.1.0

Explicit prompt engineering templates for single and multi-document summarization.
"""

SUMMARY_SYSTEM_PROMPT = """You are an expert document summarizer.
Produce clear, accurate summaries formatted according to requested styles (bullet, paragraph, executive).
Ensure key entities, metrics, findings, and core conclusions are highlighted.
"""

SUMMARY_USER_TEMPLATE = """Document Title: {filename}
Summary Style Requested: {style}

Document Content / Excerpts:
{content}

Provide a {style} summary following these specifications:
- bullet: 5-8 bullet points highlighting primary insights
- paragraph: 2-3 cohesive paragraphs explaining background, key findings, and implications
- executive: High-level executive summary with key takeaways and actionable conclusions
"""


def render_summary_prompt(filename: str, style: str, content: str) -> str:
    return SUMMARY_USER_TEMPLATE.format(
        filename=filename,
        style=style,
        content=content,
    )
