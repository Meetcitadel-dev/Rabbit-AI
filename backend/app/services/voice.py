"""Voice synthesis helper leveraging gTTS (Google Text-to-Speech)."""
from __future__ import annotations

import base64
from io import BytesIO

try:  # pragma: no cover - optional dependency
    from gtts import gTTS
except Exception:  # pragma: no cover
    gTTS = None


class VoiceService:
    def __init__(self) -> None:
        self._available = gTTS is not None

    @property
    def available(self) -> bool:
        return self._available

    def synthesize(self, text: str) -> dict:
        if not self.available:
            return {
                "available": False,
                "audio_base64": None,
                "message": "gTTS not installed; use browser voice synthesis.",
            }
        buffer = BytesIO()
        tts = gTTS(text=text, lang="en")
        tts.write_to_fp(buffer)
        audio_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return {
            "available": True,
            "audio_base64": audio_b64,
            "message": "Synthesized via gTTS (MP3 base64).",
        }

