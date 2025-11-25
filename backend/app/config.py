"""Centralized configuration for the Talking Rabbitt backend."""
from __future__ import annotations

from pathlib import Path
from typing import Final

BASE_DIR: Final[Path] = Path(__file__).resolve().parents[2]
DATA_DIR: Final[Path] = BASE_DIR / "data"
WAREHOUSE_DIR: Final[Path] = DATA_DIR / "warehouse"
FACT_TABLE_PATH: Final[Path] = WAREHOUSE_DIR / "sales_fact.parquet"
UPLOAD_DIR: Final[Path] = DATA_DIR / "uploads"
SEED_DATA_PATH: Final[Path] = DATA_DIR / "sales_seed.csv"

# LangChain / LLM settings
DEFAULT_LLM_MODEL: Final[str] = "gpt-4o-mini"
MAX_CHAT_HISTORY: Final[int] = 8

