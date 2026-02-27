export type Municipality = {
  code: string;
  name: string;
  prefecture_code: string;
  rent_avg: number | null;
  population: number | null;
  area_km2: number | null;
  geojson: GeoJSON.GeoJsonObject;
};

export type BoardPost = {
  id: number;
  municipality_code: string;
  user_id: string;
  content: string;
  created_at: string;
};
