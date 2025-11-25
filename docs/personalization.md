# Dashboard Personalization & Advanced Features

## Personas
- **CEO View** – high-level KPIs, YoY growth, anomaly alerts, neutral theme.
- **CMO View** – marketing efficiency, campaign ROI suggestions, bold theme.
- **Merch Ops View** – inventory vs demand, promo flag filters, compact cards.

Each persona maps to:
1. Default filters (regions/categories/channels).
2. Recommended prompt inserted into the chat input.
3. Suggested visualization focus (e.g., category breakdown vs. promos).

## User Preferences
- Theme toggle (light/dark) persisted in `localStorage`.
- Saved filters: store last selected region/category/date range per persona.
- Quick prompt buttons to seed common questions.
- Dark theme palette applies bespoke card backgrounds, chart colors, and typography for better contrast at night.

## Insight Extensions
- `/api/insights/recommendations` – list of top recommendations with confidence.
- `/api/insights/anomalies` – top 3 spikes/drops for selected metric.
- Frontend insight cards show badge + CTA (“Generate action plan” trigger -> chat prompt).

## Roadmap Ideas
- Upload persona-specific logo/branding.
- Role-based access to additional datasets (inventory, marketing spend).

