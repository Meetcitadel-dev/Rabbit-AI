#!/usr/bin/env python3
"""
Utility to synthesize multi-dimensional sales data for Talking Rabbitt.

The generator produces one year of daily records with the following fields:
date, week, month, quarter, region, country, channel, category, subcategory,
sku, promo_flag, units_sold, net_sales, discount_rate, marketing_spend.

Usage:
    python scripts/generate_sales_data.py [--rows 3650] [--seed 7] \
        --out data/sales_seed.csv
"""
from __future__ import annotations

import argparse
import csv
import random
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path
from typing import List, Sequence


REGIONS = {
    "North America": ["USA", "Canada"],
    "Europe": ["Germany", "France", "UK", "Spain"],
    "APAC": ["India", "Singapore", "Japan", "Australia"],
    "LATAM": ["Brazil", "Mexico", "Chile"],
}

CHANNELS = ["Online", "Retail", "Outlet", "Marketplace"]

CATEGORIES = {
    "Apparel": ["T-Shirts", "Hoodies", "Jackets"],
    "Footwear": ["Sneakers", "Running", "Sandals"],
    "Accessories": ["Caps", "Backpacks", "Watches"],
}

PROMO_TYPES = ["None", "Clearance", "BOGO", "Flash", "Loyalty"]


@dataclass
class Record:
    day: date
    region: str
    country: str
    channel: str
    category: str
    subcategory: str
    sku: str
    promo_flag: str
    units_sold: int
    net_sales: float
    discount_rate: float
    marketing_spend: float

    def as_row(self) -> List[str]:
        return [
            self.day.isoformat(),
            str(self.day.isocalendar().week),
            str(self.day.month),
            f"Q{((self.day.month - 1) // 3) + 1}",
            self.region,
            self.country,
            self.channel,
            self.category,
            self.subcategory,
            self.sku,
            self.promo_flag,
            str(self.units_sold),
            f"{self.net_sales:.2f}",
            f"{self.discount_rate:.2f}",
            f"{self.marketing_spend:.2f}",
        ]


def generate_records(start: date, days: int, *, seed: int) -> Sequence[Record]:
    random.seed(seed)
    records: List[Record] = []
    for offset in range(days):
        current_day = start + timedelta(days=offset)
        season_multiplier = _seasonality_multiplier(current_day.month)

        for region, countries in REGIONS.items():
            for category, subcategories in CATEGORIES.items():
                sub = random.choice(subcategories)
                channel = random.choice(CHANNELS)
                promo = random.choices(PROMO_TYPES, weights=[60, 15, 10, 10, 5])[0]
                country = random.choice(countries)

                base_units = random.randint(20, 120)
                promo_boost = 1.2 if promo != "None" else 1.0
                weekday_boost = 1.3 if current_day.weekday() in (4, 5) else 1.0

                units = int(base_units * season_multiplier * promo_boost * weekday_boost)
                price = _category_price(category)
                discount_rate = 0.05 if promo == "None" else random.uniform(0.1, 0.35)
                net_sales = units * price * (1 - discount_rate)
                marketing = random.uniform(200, 1500) * season_multiplier

                records.append(
                    Record(
                        day=current_day,
                        region=region,
                        country=country,
                        channel=channel,
                        category=category,
                        subcategory=sub,
                        sku=f"{category[:3].upper()}-{subcategory_code(sub)}-{offset:04d}",
                        promo_flag=promo,
                        units_sold=units,
                        net_sales=net_sales,
                        discount_rate=discount_rate,
                        marketing_spend=marketing,
                    )
                )
    return records


def _seasonality_multiplier(month: int) -> float:
    if month in (11, 12):  # holiday lift
        return 1.4
    if month in (6, 7):  # summer bump
        return 1.2
    if month in (1, 2):  # post-holiday lull
        return 0.8
    return 1.0


def _category_price(category: str) -> float:
    return {
        "Apparel": 35,
        "Footwear": 90,
        "Accessories": 45,
    }[category]


def subcategory_code(subcategory: str) -> str:
    return "".join(filter(str.isalpha, subcategory.upper()))[:3]


def write_csv(records: Sequence[Record], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    headers = [
        "date",
        "week",
        "month",
        "quarter",
        "region",
        "country",
        "channel",
        "category",
        "subcategory",
        "sku",
        "promo_flag",
        "units_sold",
        "net_sales",
        "discount_rate",
        "marketing_spend",
    ]
    with path.open("w", newline="", encoding="utf-8") as fp:
        writer = csv.writer(fp)
        writer.writerow(headers)
        for record in records:
            writer.writerow(record.as_row())


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate synthetic sales data.")
    parser.add_argument("--out", default="data/sales_seed.csv", help="Output CSV path.")
    parser.add_argument("--rows", type=int, default=365, help="Number of days to simulate.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed.")
    parser.add_argument(
        "--start-date",
        default="2024-01-01",
        help="Start date (YYYY-MM-DD) for the simulation window.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    start = date.fromisoformat(args.start_date)
    records = generate_records(start, args.rows, seed=args.seed)
    write_csv(records, Path(args.out))
    print(f"Wrote {len(records)} rows to {args.out}")


if __name__ == "__main__":
    main()

