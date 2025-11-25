from __future__ import annotations

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from .config import DATA_DIR
from .models.schemas import (
    FilterResponse,
    KPIResponse,
    MetricRequest,
    ChatRequest,
    ChatResponse,
    UploadResponse,
    VoiceRequest,
    VoiceResponse,
    TranscriptionResponse,
    RecommendationResponse,
    AnomalyResponse,
    ExportRequest,
    ComparisonRequest,
)
from .services.data_loader import DataRepository
from .services.insights import InsightEngine
from .services.chat import ChatService
from .services.voice import VoiceService
from .services.transcribe import TranscriptionService
from .services.export import ExportService


app = FastAPI(title="Talking Rabbitt API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

repository = DataRepository()
engine = InsightEngine(repository.bootstrap().frame)
chat_service = ChatService(engine)
voice_service = VoiceService()
transcription_service = TranscriptionService()


@app.on_event("startup")
async def _startup() -> None:
    dataset = repository.refresh()
    engine.update_frame(dataset.frame)


@app.get("/api/health")
async def healthcheck() -> dict:
    return {"status": "ok", "data_dir": str(DATA_DIR)}


@app.get("/api/filters", response_model=FilterResponse)
async def filters() -> FilterResponse:
    return FilterResponse(**repository.dataset.to_filters())


@app.get("/api/profile")
async def profile() -> dict:
    frame = repository.dataset.frame
    return {
        "rows": len(frame),
        "columns": len(frame.columns),
        "latest_date": frame["date"].max().date().isoformat(),
        "earliest_date": frame["date"].min().date().isoformat(),
        "categories": frame["category"].nunique(),
        "regions": frame["region"].nunique(),
    }


@app.post("/api/metrics/kpi", response_model=KPIResponse)
async def kpi(payload: MetricRequest) -> KPIResponse:
    block = engine.kpis(
        start=payload.start,
        end=payload.end,
        region=payload.region,
        category=payload.category,
        channel=payload.channel,
        promo_flag=payload.promo_flag,
    )
    return KPIResponse(**block.__dict__)


@app.post("/api/metrics/breakdown")
async def breakdown(payload: MetricRequest, group_by: str = "region"):
    data = engine.breakdown(
        by=group_by,
        start=payload.start,
        end=payload.end,
        region=payload.region,
        category=payload.category,
        channel=payload.channel,
        promo_flag=payload.promo_flag,
    )
    return {"group_by": group_by, "data": data}


@app.post("/api/metrics/series")
async def series(payload: MetricRequest, metric: str = "net_sales", freq: str = "M"):
    data = engine.series(
        metric=metric,
        freq=freq,
        start=payload.start,
        end=payload.end,
        region=payload.region,
        category=payload.category,
        channel=payload.channel,
        promo_flag=payload.promo_flag,
    )
    return {"metric": metric, "freq": freq, "data": data}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    result = chat_service.ask(
        payload.question,
        start=payload.start,
        end=payload.end,
        region=payload.region,
        category=payload.category,
        channel=payload.channel,
        promo_flag=payload.promo_flag,
    )
    return ChatResponse(**result)


@app.post("/api/voice/speak", response_model=VoiceResponse)
async def voice(payload: VoiceRequest) -> VoiceResponse:
    result = voice_service.synthesize(payload.text)
    return VoiceResponse(**result)


@app.post("/api/voice/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)) -> TranscriptionResponse:
    contents = await file.read()
    result = transcription_service.transcribe(contents, file.filename)
    return TranscriptionResponse(**result)


@app.post("/api/insights/recommendations", response_model=RecommendationResponse)
async def recommendations(payload: MetricRequest) -> RecommendationResponse:
    items = engine.recommendations(
        start=payload.start,
        end=payload.end,
        region=payload.region,
        category=payload.category,
        channel=payload.channel,
        promo_flag=payload.promo_flag,
    )
    return RecommendationResponse(items=items)


@app.post("/api/insights/anomalies", response_model=AnomalyResponse)
async def anomalies(payload: MetricRequest) -> AnomalyResponse:
    data = engine.anomalies(
        start=payload.start,
        end=payload.end,
        region=payload.region,
        category=payload.category,
        channel=payload.channel,
        promo_flag=payload.promo_flag,
    )
    return AnomalyResponse(items=data[:5])


@app.post("/api/upload", response_model=UploadResponse)
async def upload(file: UploadFile = File(...)) -> UploadResponse:
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV uploads are supported.")
    contents = await file.read()
    before = len(repository.dataset.frame)
    dataset = repository.append_upload(contents, file.filename)
    engine.update_frame(dataset.frame)
    return UploadResponse(
        rows_ingested=len(dataset.frame) - before,
        total_rows=len(dataset.frame),
        message=f"File {file.filename} ingested successfully.",
    )


@app.post("/api/export")
async def export_data(payload: ExportRequest):
    """Export filtered data in requested format."""
    filtered = engine._filter_frame(
        start=payload.start,
        end=payload.end,
        region=payload.region,
        category=payload.category,
        channel=payload.channel,
        promo_flag=payload.promo_flag,
    )
    result = ExportService.prepare_export(
        filtered,
        fmt=payload.format,
        metric=payload.metric,
    )
    filename = f"rabbitt_export_{payload.format}.{result['extension']}"
    return Response(
        content=result["data"],
        media_type=result["content_type"],
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@app.post("/api/comparison")
async def comparison(payload: ComparisonRequest):
    """Compare KPIs between two time periods."""
    base_kpi = engine.kpis(
        start=payload.base_start,
        end=payload.base_end,
        region=payload.region,
        category=payload.category,
        channel=payload.channel,
    )
    compare_kpi = engine.kpis(
        start=payload.compare_start,
        end=payload.compare_end,
        region=payload.region,
        category=payload.category,
        channel=payload.channel,
    )
    return {
        "base": base_kpi.__dict__,
        "compare": compare_kpi.__dict__,
        "delta": {
            "total_sales": compare_kpi.total_sales - base_kpi.total_sales,
            "total_units": compare_kpi.total_units - base_kpi.total_units,
            "avg_discount": compare_kpi.avg_discount - base_kpi.avg_discount,
        },
    }

