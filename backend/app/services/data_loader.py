"""Utilities for loading, persisting, and filtering sales data."""
from __future__ import annotations

import io
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Optional

import duckdb
import pandas as pd

from ..config import FACT_TABLE_PATH, SEED_DATA_PATH, UPLOAD_DIR, WAREHOUSE_DIR


REQUIRED_COLUMNS = {
    "date": "datetime64[ns]",
    "week": "Int64",
    "month": "Int64",
    "quarter": "string",
    "region": "string",
    "country": "string",
    "channel": "string",
    "category": "string",
    "subcategory": "string",
    "sku": "string",
    "promo_flag": "string",
    "units_sold": "Int64",
    "net_sales": "float",
    "discount_rate": "float",
    "marketing_spend": "float",
}


@dataclass
class Dataset:
    frame: pd.DataFrame

    def to_filters(self) -> Dict[str, list]:
        return {
            "regions": sorted(self.frame["region"].dropna().unique().tolist()),
            "countries": sorted(self.frame["country"].dropna().unique().tolist()),
            "channels": sorted(self.frame["channel"].dropna().unique().tolist()),
            "categories": sorted(self.frame["category"].dropna().unique().tolist()),
            "promo_flags": sorted(self.frame["promo_flag"].dropna().unique().tolist()),
            "date_range": [
                self.frame["date"].min().date().isoformat(),
                self.frame["date"].max().date().isoformat(),
            ],
        }


class DataRepository:
    """Manages the canonical dataset stored as Parquet."""

    def __init__(self) -> None:
        self._dataset: Optional[Dataset] = None
        WAREHOUSE_DIR.mkdir(parents=True, exist_ok=True)
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    def bootstrap(self) -> Dataset:
        if FACT_TABLE_PATH.exists():
            con = duckdb.connect()
            frame = con.execute(
                f"SELECT * FROM read_parquet('{FACT_TABLE_PATH.as_posix()}')"
            ).df()
            con.close()
        else:
            frame = pd.read_csv(SEED_DATA_PATH)
            frame["date"] = pd.to_datetime(frame["date"])
            self._write_frame(frame)
        self._dataset = Dataset(frame=frame)
        return self._dataset

    @property
    def dataset(self) -> Dataset:
        if self._dataset is None:
            return self.bootstrap()
        return self._dataset

    def refresh(self) -> Dataset:
        return self.bootstrap()

    def append_upload(self, file_bytes: bytes, filename: str) -> Dataset:
        upload_path = UPLOAD_DIR / filename
        upload_path.write_bytes(file_bytes)

        new_frame = pd.read_csv(io.BytesIO(file_bytes))
        new_frame["date"] = pd.to_datetime(new_frame["date"])
        new_frame = _harmonize_columns(new_frame)
        combined = pd.concat([self.dataset.frame, new_frame], ignore_index=True)
        self._write_frame(combined)
        self._dataset = Dataset(frame=combined)
        return self._dataset

    def filtered_frame(
        self, *, region=None, category=None, channel=None, promo_flag=None, start=None, end=None
    ) -> pd.DataFrame:
        frame = self.dataset.frame.copy()
        if region:
            frame = frame[frame["region"].isin(region if isinstance(region, list) else [region])]
        if category:
            frame = frame[frame["category"].isin(category if isinstance(category, list) else [category])]
        if channel:
            frame = frame[frame["channel"].isin(channel if isinstance(channel, list) else [channel])]
        if promo_flag:
            frame = frame[
                frame["promo_flag"].isin(promo_flag if isinstance(promo_flag, list) else [promo_flag])
            ]
        if start:
            frame = frame[frame["date"] >= pd.to_datetime(start)]
        if end:
            frame = frame[frame["date"] <= pd.to_datetime(end)]
        return frame

    def _write_frame(self, frame: pd.DataFrame) -> None:
        frame.sort_values("date", inplace=True)
        con = duckdb.connect()
        con.register("sales_df", frame)
        con.execute(f"COPY sales_df TO '{FACT_TABLE_PATH.as_posix()}' (FORMAT PARQUET)")
        con.unregister("sales_df")
        con.close()


def _harmonize_columns(frame: pd.DataFrame) -> pd.DataFrame:
    for column, dtype in REQUIRED_COLUMNS.items():
        if column not in frame.columns:
            frame[column] = pd.NA
        if dtype.startswith("datetime"):
            frame[column] = pd.to_datetime(frame[column], errors="coerce")
        elif dtype == "Int64":
            frame[column] = pd.to_numeric(frame[column], errors="coerce").astype("Int64")
        elif dtype == "float":
            frame[column] = pd.to_numeric(frame[column], errors="coerce")
        else:
            frame[column] = frame[column].astype("string")
    return frame

