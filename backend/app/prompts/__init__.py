from app.prompts.agent_prompt import AGENT_REACT_PROMPT
from app.prompts.qa_prompt import QA_SYSTEM_PROMPT, render_qa_prompt
from app.prompts.quiz_prompt import QUIZ_SYSTEM_PROMPT, render_quiz_prompt
from app.prompts.summary_prompt import SUMMARY_SYSTEM_PROMPT, render_summary_prompt

__all__ = [
    "QA_SYSTEM_PROMPT",
    "render_qa_prompt",
    "SUMMARY_SYSTEM_PROMPT",
    "render_summary_prompt",
    "QUIZ_SYSTEM_PROMPT",
    "render_quiz_prompt",
    "AGENT_REACT_PROMPT",
]
