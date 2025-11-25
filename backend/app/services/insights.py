"""Insight computation utilities for Talking Rabbitt."""
from __future__ import annotations

import math
import statistics
from dataclasses import dataclass
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd


@dataclass
class KPIBlock:
    total_sales: float
    total_units: int
    avg_discount: float
    marketing_efficiency: float
    growth_vs_prev_period: float


class InsightEngine:
    def __init__(self, frame: pd.DataFrame) -> None:
        self.frame = frame.copy()

    def update_frame(self, frame: pd.DataFrame) -> None:
        self.frame = frame.copy()

    # KPI aggregates
    def kpis(
        self, start=None, end=None, region=None, category=None, channel=None, promo_flag=None
    ) -> KPIBlock:
        filtered = self._filter_frame(
            start, end, region, category, channel=channel, promo_flag=promo_flag
        )
        prev_period = self._previous_period_frame(
            start, end, region, category, channel, promo_flag
        )
        total_sales = float(filtered["net_sales"].sum())
        total_units = int(filtered["units_sold"].sum())
        avg_discount = float(filtered["discount_rate"].mean() or 0)
        marketing_efficiency = (
            float(filtered["net_sales"].sum() / filtered["marketing_spend"].sum())
            if filtered["marketing_spend"].sum() > 0
            else 0.0
        )
        growth = self._growth_percentage(filtered, prev_period)
        return KPIBlock(
            total_sales=round(total_sales, 2),
            total_units=total_units,
            avg_discount=round(avg_discount, 4),
            marketing_efficiency=round(marketing_efficiency, 4),
            growth_vs_prev_period=round(growth, 4),
        )

    # Time series
    def series(self, metric: str = "net_sales", freq: str = "M", **filters) -> List[Dict]:
        filtered = self._filter_frame(**filters)
        freq_alias = "MS" if freq == "M" else freq
        grouper = filtered.set_index("date").groupby(pd.Grouper(freq=freq_alias))[metric].sum()
        return [{"period": str(idx.date()), "value": round(val, 2)} for idx, val in grouper.items()]

    # Category or region breakdown
    def breakdown(self, by: str = "region", metric: str = "net_sales", **filters) -> List[Dict]:
        filtered = self._filter_frame(**filters)
        breakdown_df = (
            filtered.groupby(by)[metric].sum().sort_values(ascending=False).reset_index()
        )
        total = breakdown_df[metric].sum() or 1
        breakdown_df["share"] = breakdown_df[metric] / total
        return [
            {
                by: row[by],
                "value": round(row[metric], 2),
                "share": round(row["share"], 4),
            }
            for _, row in breakdown_df.iterrows()
        ]

    # Anomaly detection (simple z-score against rolling mean)
    def anomalies(self, metric: str = "net_sales", window: int = 7, **filters) -> List[Dict]:
        filtered = self._filter_frame(**filters)
        ts = filtered.set_index("date").groupby(pd.Grouper(freq="D"))[metric].sum().fillna(0)
        rolling = ts.rolling(window=window, min_periods=window).mean()
        std = ts.rolling(window=window, min_periods=window).std()
        z_scores = (ts - rolling) / std
        anomalies = z_scores[abs(z_scores) >= 2].dropna()
        return [
            {
                "date": idx.date().isoformat(),
                "metric": metric,
                "value": round(ts.loc[idx], 2),
                "z_score": round(z_scores.loc[idx], 2),
            }
            for idx in anomalies.index
        ]

    def recommendations(self, limit: int = 5, **filters) -> List[str]:
        statements: List[str] = []
        top_regions = self.breakdown("region", **filters)[:3]
        if top_regions:
            top = top_regions[0]
            statements.append(
                f"Double down on {top['region']} where it contributes {top['share']*100:.1f}% of sales."
            )
        anomalies = self.anomalies(**filters)
        if anomalies:
            latest = anomalies[-1]
            direction = "spike" if latest["z_score"] > 0 else "drop"
            statements.append(
                f"Investigate {direction} on {latest['date']} for {latest['metric']} (z={latest['z_score']})."
            )
        category_mix = self.breakdown("category", **filters)
        if category_mix:
            laggards = category_mix[-1]
            statements.append(
                f"Consider promo bundles for {laggards['category']} which only holds {laggards['share']*100:.1f}% share."
            )
        if len(statements) < limit:
            statements.append(
                "Explore loyalty offers to lift repeat purchases in underperforming channels."
            )
        return statements[:limit]

    def narrative_answer(self, question: str, **filters) -> Dict:
        """
        Rudimentary NL interpretation: looks for keywords to decide which aggregation to run.
        Acts as a placeholder for LangChain SQL generation, enabling local demos without keys.
        """
        q_lower = question.lower()
        if "top" in q_lower and ("region" in q_lower or "country" in q_lower):
            breakdown = self.breakdown("region", **filters)[:5]
            summary = ", ".join(
                f"{row['region']} ({row['share']*100:.1f}%)" for row in breakdown
            )
            return {
                "type": "breakdown",
                "narrative": f"Top regions by sales: {summary}.",
                "data": breakdown,
            }
        if "category" in q_lower:
            data = self.breakdown("category", **filters)
            summary = f"{data[0]['category']} leads with {data[0]['share']*100:.1f}% share."
            return {"type": "breakdown", "narrative": summary, "data": data}
        if "trend" in q_lower or "over time" in q_lower or "quarter" in q_lower:
            data = self.series(freq="Q", **filters)
            summary = f"Quarterly sales ranged from {data[0]['value']:.0f} to {data[-1]['value']:.0f}."
            return {"type": "series", "narrative": summary, "data": data}
        if "why" in q_lower or "drop" in q_lower or "decline" in q_lower:
            anomalies = self.anomalies()
            if anomalies:
                latest = anomalies[-1]
                narrative = (
                    f"Detected {latest['metric']} {('spike' if latest['z_score']>0 else 'drop')} "
                    f"on {latest['date']} with z-score {latest['z_score']}."
                )
            else:
                narrative = "No significant anomalies detected in the selected window."
            return {"type": "anomaly", "narrative": narrative, "data": anomalies}
        # default KPI summary
        kpi = self.kpis(**filters)
        narrative = (
            f"Sales reached ${kpi.total_sales:,.0f} with {kpi.total_units:,} units. "
            f"Marketing efficiency sits at {kpi.marketing_efficiency:.2f} and discounts averaged "
            f"{kpi.avg_discount*100:.1f}%."
        )
        return {
            "type": "kpi",
            "narrative": narrative,
            "data": kpi.__dict__,
        }

    def _filter_frame(
        self, start=None, end=None, region=None, category=None, channel=None, promo_flag=None, **_
    ) -> pd.DataFrame:
        frame = self.frame.copy()
        if start:
            frame = frame[frame["date"] >= pd.to_datetime(start)]
        if end:
            frame = frame[frame["date"] <= pd.to_datetime(end)]
        if region:
            frame = frame[frame["region"].isin(region if isinstance(region, list) else [region])]
        if category:
            frame = frame[
                frame["category"].isin(category if isinstance(category, list) else [category])
            ]
        if channel:
            frame = frame[
                frame["channel"].isin(channel if isinstance(channel, list) else [channel])
            ]
        if promo_flag:
            frame = frame[
                frame["promo_flag"].isin(
                    promo_flag if isinstance(promo_flag, list) else [promo_flag]
                )
            ]
        return frame

    def _previous_period_frame(self, start, end, region, category, channel, promo_flag) -> pd.DataFrame:
        if not start or not end:
            return pd.DataFrame(columns=self.frame.columns)
        start_dt = pd.to_datetime(start)
        end_dt = pd.to_datetime(end)
        duration = end_dt - start_dt
        prev_start = start_dt - duration
        prev_end = start_dt
        return self._filter_frame(prev_start, prev_end, region, category, channel, promo_flag)

    @staticmethod
    def _growth_percentage(current: pd.DataFrame, previous: pd.DataFrame) -> float:
        prev_sales = previous["net_sales"].sum()
        current_sales = current["net_sales"].sum()
        if prev_sales == 0:
            return 0.0
        return (current_sales - prev_sales) / prev_sales

