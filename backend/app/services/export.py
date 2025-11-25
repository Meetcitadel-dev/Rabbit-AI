"""Data export service supporting multiple formats."""
import io
import json
from typing import Dict

import pandas as pd


class ExportService:
    @staticmethod
    def export_to_csv(frame: pd.DataFrame) -> bytes:
        """Export DataFrame to CSV bytes."""
        buffer = io.StringIO()
        frame.to_csv(buffer, index=False)
        return buffer.getvalue().encode("utf-8")

    @staticmethod
    def export_to_json(frame: pd.DataFrame) -> bytes:
        """Export DataFrame to JSON bytes."""
        data = frame.to_dict(orient="records")
        return json.dumps(data, default=str, indent=2).encode("utf-8")

    @staticmethod
    def export_to_excel(frame: pd.DataFrame) -> bytes:
        """Export DataFrame to Excel bytes (requires openpyxl)."""
        buffer = io.BytesIO()
        try:
            frame.to_excel(buffer, index=False, engine="openpyxl")
            buffer.seek(0)
            return buffer.getvalue()
        except ImportError:
            # Fallback to CSV if openpyxl not installed
            return ExportService.export_to_csv(frame)

    @staticmethod
    def prepare_export(
        frame: pd.DataFrame,
        fmt: str = "csv",
        metric: str = "all",
        **filters
    ) -> Dict[str, any]:
        """
        Prepare data export in requested format.
        Returns dict with 'data' (bytes) and 'content_type' for HTTP response.
        """
        # Apply filters if provided
        if filters:
            for key, value in filters.items():
                if value and key in frame.columns:
                    if isinstance(value, list):
                        frame = frame[frame[key].isin(value)]

        # Select metric columns if specified
        if metric != "all":
            if metric in frame.columns:
                frame = frame[["date", metric]]
            else:
                frame = frame  # keep all if metric not found

        if fmt == "json":
            return {
                "data": ExportService.export_to_json(frame),
                "content_type": "application/json",
                "extension": "json",
            }
        elif fmt == "excel":
            return {
                "data": ExportService.export_to_excel(frame),
                "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "extension": "xlsx",
            }
        else:  # default csv
            return {
                "data": ExportService.export_to_csv(frame),
                "content_type": "text/csv",
                "extension": "csv",
            }

