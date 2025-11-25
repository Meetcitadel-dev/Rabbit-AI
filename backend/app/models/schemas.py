"""Pydantic schemas for API requests/responses."""
from __future__ import annotations

from datetime import date
from typing import List, Optional, Union

from pydantic import BaseModel, Field


class FilterResponse(BaseModel):
    regions: List[str]
    countries: List[str]
    channels: List[str]
    categories: List[str]
    promo_flags: List[str]
    date_range: List[str]


class UploadResponse(BaseModel):
    rows_ingested: int
    total_rows: int
    message: str


class KPIResponse(BaseModel):
    total_sales: float
    total_units: int
    avg_discount: float
    marketing_efficiency: float
    growth_vs_prev_period: float


class MetricRequest(BaseModel):
    start: Optional[date] = None
    end: Optional[date] = None
    region: Optional[List[str]] = Field(default=None)
    category: Optional[List[str]] = Field(default=None)
    channel: Optional[List[str]] = Field(default=None)
    promo_flag: Optional[List[str]] = Field(default=None)


class ChatRequest(MetricRequest):
    question: str


class ChatResponse(BaseModel):
    type: str
    narrative: str
    data: Union[dict, list]
    history: List[dict]


class VoiceRequest(BaseModel):
    text: str


class VoiceResponse(BaseModel):
    available: bool
    audio_base64: Optional[str] = None
    message: str


class TranscriptionResponse(BaseModel):
    success: bool
    text: Optional[str] = None
    message: str


class RecommendationResponse(BaseModel):
    items: List[str]


class AnomalyItem(BaseModel):
    date: str
    metric: str
    value: float
    z_score: float


class AnomalyResponse(BaseModel):
    items: List[AnomalyItem]


class ExportRequest(BaseModel):
    format: str = "csv"  # csv, json, excel
    metric: str = "all"
    start: Optional[date] = None
    end: Optional[date] = None
    region: Optional[List[str]] = None
    category: Optional[List[str]] = None
    channel: Optional[List[str]] = None
    promo_flag: Optional[List[str]] = None


class AlertConfig(BaseModel):
    id: Optional[str] = None
    metric: str
    condition: str  # gt, lt, eq
    threshold: float
    enabled: bool = True


class ComparisonRequest(BaseModel):
    base_start: Optional[date] = None
    base_end: Optional[date] = None
    compare_start: Optional[date] = None
    compare_end: Optional[date] = None
    region: Optional[List[str]] = None
    category: Optional[List[str]] = None
    channel: Optional[List[str]] = None

