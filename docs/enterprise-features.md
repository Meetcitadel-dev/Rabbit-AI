# Enterprise Analytics Features

## Data Export
Export your filtered datasets in multiple formats for offline analysis or reporting:

- **Endpoint**: `POST /api/export`
- **Formats**: CSV, JSON, Excel (XLSX)
- **Usage**: Click the "Export" dropdown in the dashboard header, select format, download triggers automatically.

## Period Comparison
Compare KPIs across two custom date ranges:

- **Endpoint**: `POST /api/comparison`
- **Payload**: `{ base_start, base_end, compare_start, compare_end, ...filters }`
- **Returns**: Base period metrics, compare period metrics, and deltas (sales, units, discounts).
- **UI**: "Compare Periods" button opens a modal with date pickers and result visualization.

## Date Range Presets
Quick filters for common time windows:

- Last 7 Days
- Last 30 Days
- Last Quarter (90 days)
- Year-to-Date

Presets auto-populate start/end dates in the filter bar for rapid slicing.

## Drill-Down Views
Every breakdown chart (Regional Split, Category Mix) includes a "View Details" button:

- Opens a modal with a sortable data table showing all underlying rows.
- Useful for exporting specific segments or investigating outliers.

## Dashboard Customization
Toggle widget visibility to create personalized layouts:

- **Widgets**: KPI Cards, Sales Trend Chart, Regional Split, Category Mix, Chat Panel, Insight Highlights.
- **Persistence**: Layout preferences saved in `localStorage` per user session.
- **UI**: Click "Customize Layout" in the header to open the drawer with on/off toggles.

## Anomaly Detection & Recommendations
Automated insight generation:

- **Anomalies**: Z-score-based spike/drop detection on daily sales trends.
- **Recommendations**: Rule-based suggestions (e.g., "Double down on North America," "Investigate Q2 drop").
- **Endpoints**: `/api/insights/anomalies`, `/api/insights/recommendations`.
- **Display**: Insight highlight cards next to the chat panel.

## Real-Time Filtering
All metrics endpoints accept the same filter schema:

- `start`, `end` (date strings)
- `region`, `category`, `channel`, `promo_flag` (arrays of strings)

Filters are applied consistently across KPIs, series, breakdowns, chat, and export operations.

## Planned Enhancements
- **Custom Alerts**: Email/Slack notifications when KPIs breach thresholds.
- **Scheduled Reports**: Weekly/monthly PDF exports with automated insights.
- **Role-Based Access**: Persona-specific data visibility and dashboard configs.
- **Inventory Integration**: Link sales data to stock levels for demand forecasting.

