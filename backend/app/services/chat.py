"""Conversational orchestration layer for Talking Rabbitt."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Deque, Dict, List
from collections import deque

from .insights import InsightEngine
from ..config import DEFAULT_LLM_MODEL, MAX_CHAT_HISTORY

try:
    from langchain.chat_models import ChatOpenAI  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    ChatOpenAI = None  # type: ignore


@dataclass
class ConversationMemory:
    max_items: int = MAX_CHAT_HISTORY
    items: Deque[Dict[str, str]] = field(default_factory=lambda: deque(maxlen=MAX_CHAT_HISTORY))

    def add(self, role: str, content: str) -> None:
        self.items.append({"role": role, "content": content})

    def as_ctx(self) -> List[Dict[str, str]]:
        return list(self.items)


class ChatService:
    """
    Combines structured insights with optional LLM-backed narratives.
    Falls back to rule-based summaries when LLM credentials are absent.
    """

    def __init__(self, engine: InsightEngine) -> None:
        self.engine = engine
        self.memory = ConversationMemory()
        self.llm = None
        api_key = os.environ.get("OPENAI_API_KEY")
        if api_key and ChatOpenAI:
            self.llm = ChatOpenAI(model_name=DEFAULT_LLM_MODEL, temperature=0.2)

    def ask(self, question: str, **filters) -> Dict:
        self.memory.add("user", question)
        structured = self.engine.narrative_answer(question, **filters)

        if self.llm:
            prompt = self._build_prompt(question, structured)
            llm_answer = self.llm.predict(prompt)  # type: ignore[attr-defined]
            structured["narrative"] = llm_answer.strip()

        self.memory.add("assistant", structured["narrative"])
        structured["history"] = self.memory.as_ctx()
        return structured

    def _build_prompt(self, question: str, structured: Dict) -> str:
        return (
            "You are Talking Rabbitt, a concise sales-analytics AI. "
            "Given the structured insight below, craft a business-friendly answer "
            "within 3 sentences.\n\n"
            f"Question: {question}\n"
            f"Structured Insight: {structured}\n"
            "Answer:"
        )

