Talking Rabbitt – AI-Powered Talking Dashboard
===============================================

## Vision

Talking Rabbitt is a conversational analytics assistant designed for brand leadership teams. It unifies structured sales data, AI-generated insights, and multimodal interactions (text, charts, and voice) to deliver rapid answers to growth questions such as “Where did Q2 softness originate?” or “Which offers could revive underperforming SKUs?”.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend (Next.js)                        │
│  - Chakra UI dashboard layout (KPI cards, charts, filters)          │
│  - Conversational panel with Web Speech API voice input/output      │
│  - SWR hooks to call backend APIs                                   │
└──────────────▲──────────────────────────────────────────────────────┘
               │ HTTPS JSON / SSE
┌──────────────┴──────────────────────────────────────────────────────┐
│                     Backend (FastAPI + LangChain)                   │
│  - Data ingestion & validation endpoints                            │
│  - Metric/KPI aggregation backed by DuckDB Parquet store            │
│  - Insight engine (trend detection, anomalies, recs)                │
│  - Chat/voice endpoints orchestrating NL → SQL → narrative pipeline │
└──────────────▲──────────────────────────────────────────────────────┘
               │
┌──────────────┴──────────────────────────────────────────────────────┐
│                      Data Layer (Parquet + DuckDB)                  │
│  - Raw uploads staged in `/data/uploads`                            │
│  - Cleaned fact table stored as Parquet partitions                  │
│  - Synthetic seed data generated via `scripts/generate_sales_data`  │
└────────────────────────────────────────────────────────────────────┘
```

Key responsibilities:

- **Data ingestion service** cleans uploaded CSV/XLSX files, harmonizes columns, and writes Parquet backed by DuckDB for fast aggregations.
- **Analytics API** exposes KPI summaries (e.g., YoY growth, regional splits) and powers dashboards via filterable endpoints.
- **Insight engine** layers domain rules (promo flags, seasonality) with an LLM chain that converts natural-language prompts into SQL, augments replies with chart URLs, and emits recommendations with confidence scores.
- **Conversational/voice interface** preserves short-term memory, streams textual answers, and offers browser-based speech synthesis for “talking” responses.

## Repo Layout

```
backend/         FastAPI app, LangChain pipelines, analytics services
frontend/        Next.js 14 app router UI with Chakra UI + Recharts
data/            Seed datasets (synthetic sales CSV, staging area)
scripts/         Tooling (e.g., data generation utilities)
docs/            Additional design notes, prompt templates, pitch outline
```

## Getting Started

### 1. Backend API
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Environment variables:
- `OPENAI_API_KEY` (optional) – enables LangChain-powered narratives in `/api/chat`.
- `NEXT_PUBLIC_API_BASE` (frontend) should match the FastAPI URL (defaults to `http://localhost:8000`).

### 2. Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:3000` to interact with the Talking Rabbitt dashboard, filter metrics, and converse with the AI assistant.

### 3. Synthetic Data Refresh
Regenerate the one-year sales dataset (adjust rows/seed as needed):
```bash
python scripts/generate_sales_data.py --rows 365 --seed 13 --out data/sales_seed.csv
```
Restart the backend to reload the latest fact table.

### 4. Tests
```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

## Feature Highlights

### Core Analytics
- **Dynamic Visualizations**: KPI cards, trend charts, regional/category breakdowns with live drill-down modals.
- **Persona presets** tailor filters, prompts, and KPIs for CEO/CMO/Merch Ops flows.
- **Advanced filters** include promo flags, date ranges with quick presets (Last 7/30/90 Days, YTD), and dark-mode UI preferences persisted in `localStorage`.

### AI & Insights
- **Conversational Interface**: Natural language queries answered by LangChain + OpenAI chains with chart-linked responses.
- **Insight highlights** expose anomaly alerts and AI recommendations via `/api/insights/*` endpoints.
- **Voice loop** handles text-to-speech plus OpenAI transcription when `OPENAI_API_KEY` is provided in `.env`.

### Enterprise Features
- **Data Export**: Download filtered datasets as CSV, JSON, or Excel via `/api/export`.
- **Period Comparison**: Compare KPIs between two time ranges side-by-side with delta highlighting.
- **Dashboard Customization**: Toggle widget visibility (KPIs, trend chart, chat panel, etc.) and persist layout preferences.
- **Drill-Down Tables**: View underlying data rows from any breakdown chart with sortable table modals.

## Next Steps

1. Implement backend ingestion, KPI, and chat endpoints (`backend/app/main.py`, `backend/app/services/*`).
2. Build the conversational insight panel and dynamic dashboards inside `frontend/app`.
3. Extend tests plus documentation (`backend/tests`, `docs/demo-script.md`) to support demos and commercial pitch-readiness.

Refer to `scripts/generate_sales_data.py` and `data/sales_seed.csv` for the base dataset used during early development.

