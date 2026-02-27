#!/usr/bin/env python3
"""Import municipality GeoJSON + rent CSV into Supabase."""

from __future__ import annotations

import argparse
import csv
import json
import os
from pathlib import Path

from supabase import Client, create_client


def load_rent_map(path: Path) -> dict[str, float]:
  with path.open(encoding="utf-8") as fp:
    reader = csv.DictReader(fp)
    return {row["municipality_code"]: float(row["rent_avg"]) for row in reader}


def main() -> None:
  parser = argparse.ArgumentParser()
  parser.add_argument("--geojson", default="data/municipalities.geojson")
  parser.add_argument("--rent", default="data/rent_avg.csv")
  parser.add_argument("--supabase-url", default=os.getenv("NEXT_PUBLIC_SUPABASE_URL", ""))
  parser.add_argument("--service-role-key", default=os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""))
  args = parser.parse_args()

  if not args.supabase_url or not args.service_role_key:
    raise SystemExit("Supabase URL/Service role key が必要です。")

  supabase: Client = create_client(args.supabase_url, args.service_role_key)
  rent_map = load_rent_map(Path(args.rent))
  geo = json.loads(Path(args.geojson).read_text(encoding="utf-8"))

  rows = []
  for feature in geo.get("features", []):
    props = feature.get("properties", {})
    code = props.get("code")
    if not code:
      continue
    rows.append(
      {
        "code": code,
        "prefecture_code": props.get("prefecture_code"),
        "name": props.get("name"),
        "rent_avg": rent_map.get(code),
        "population": props.get("population"),
        "area_km2": props.get("area_km2"),
        "geojson": feature.get("geometry"),
      }
    )

  supabase.table("municipalities").upsert(rows).execute()
  print(f"upserted: {len(rows)} municipalities")


if __name__ == "__main__":
  main()
