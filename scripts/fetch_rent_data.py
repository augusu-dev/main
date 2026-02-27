#!/usr/bin/env python3
"""Fetch municipality average rent from e-Stat table data."""

from __future__ import annotations

import argparse
import csv
import os
from pathlib import Path

import requests

ESTAT_ENDPOINT = "https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData"
DEFAULT_STATS_DATA_ID = "0003422730"


def fetch_rows(api_key: str, stats_data_id: str) -> list[dict]:
  params = {
    "appId": api_key,
    "statsDataId": stats_data_id,
    "lang": "J",
    "metaGetFlg": "N",
    "cntGetFlg": "N",
  }
  response = requests.get(ESTAT_ENDPOINT, params=params, timeout=60)
  response.raise_for_status()
  values = response.json()["GET_STATS_DATA"]["STATISTICAL_DATA"]["DATA_INF"]["VALUE"]
  return values if isinstance(values, list) else [values]


def to_csv(rows: list[dict], output: Path) -> None:
  output.parent.mkdir(parents=True, exist_ok=True)
  with output.open("w", encoding="utf-8", newline="") as fp:
    writer = csv.DictWriter(fp, fieldnames=["municipality_code", "rent_avg"])
    writer.writeheader()
    for row in rows:
      area = row.get("@area", "")
      value = row.get("$", "")
      if not area or value in {"-", ""}:
        continue
      writer.writerow({"municipality_code": area[-5:], "rent_avg": value})


def main() -> None:
  parser = argparse.ArgumentParser()
  parser.add_argument("--api-key", default=os.getenv("ESTAT_API_KEY", ""))
  parser.add_argument("--stats-data-id", default=DEFAULT_STATS_DATA_ID)
  parser.add_argument("--output", default="data/rent_avg.csv")
  args = parser.parse_args()

  if not args.api_key:
    raise SystemExit("ESTAT APIキーが必要です。--api-key か ESTAT_API_KEY を指定してください。")

  rows = fetch_rows(args.api_key, args.stats_data_id)
  to_csv(rows, Path(args.output))
  print(f"saved: {args.output}")


if __name__ == "__main__":
  main()
