"""Speech-to-text helper leveraging OpenAI's transcription API."""
from __future__ import annotations

import io
import os
from typing import Dict

try:  # pragma: no cover
    from openai import OpenAI
except Exception:  # pragma: no cover
    OpenAI = None  # type: ignore


class TranscriptionService:
    def __init__(self) -> None:
        api_key = os.environ.get("OPENAI_API_KEY")
        self._client = OpenAI() if api_key and OpenAI else None

    @property
    def available(self) -> bool:
        return self._client is not None

    def transcribe(self, file_bytes: bytes, filename: str = "audio.webm") -> Dict:
        if not self.available:
            return {
                "success": False,
                "text": None,
                "message": "Speech-to-text requires OPENAI_API_KEY; falling back to manual entry.",
            }
        buffer = io.BytesIO(file_bytes)
        buffer.name = filename or "audio.webm"
        buffer.seek(0)
        response = self._client.audio.transcriptions.create(
            model="gpt-4o-mini-transcribe",
            file=buffer,
            language="en",
        )
        text = response.text.strip()
        return {"success": True, "text": text, "message": "Transcription complete."}

