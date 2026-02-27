#!/usr/bin/env python3
"""Fetch and simplify municipality boundary GeoJSON for Japan."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import requests

N03_GEOJSON_URL = "https://geoshape.ex.nii.ac.jp/city/20200101/geojson/ja_2020.geojson"


def fetch_geojson(url: str) -> dict:
  response = requests.get(url, timeout=60)
  response.raise_for_status()
  return response.json()


def simplify_payload(payload: dict) -> dict:
  features = []
  for feature in payload.get("features", []):
    props = feature.get("properties", {})
    code = str(props.get("N03_007", ""))
    name = props.get("N03_004", "")
    pref_code = code[:2]
    features.append(
      {
        "type": "Feature",
        "properties": {
          "code": code,
          "name": name,
          "prefecture_code": pref_code,
          "rent_avg": None,
          "population": None,
          "area_km2": None,
        },
        "geometry": feature.get("geometry"),
      }
    )
  return {"type": "FeatureCollection", "features": features}


def main() -> None:
  parser = argparse.ArgumentParser()
  parser.add_argument("--output", default="data/municipalities.geojson")
  parser.add_argument("--source", default=N03_GEOJSON_URL)
  args = parser.parse_args()

  payload = fetch_geojson(args.source)
  simplified = simplify_payload(payload)

  out = Path(args.output)
  out.parent.mkdir(parents=True, exist_ok=True)
  out.write_text(json.dumps(simplified, ensure_ascii=False), encoding="utf-8")
  print(f"saved: {out}")


if __name__ == "__main__":
  main()
