import fallbackGeo from '@/data/fallback/municipalities';
import type { Municipality } from './types';
import { createClient } from './supabase/server';

export async function getMunicipalities(): Promise<Municipality[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('municipalities')
      .select('code,name,prefecture_code,rent_avg,population,area_km2,geojson');

    if (data && data.length > 0) {
      return data as Municipality[];
    }
  } catch {
    // fallback to static sample for first deployment
  }

  return ((fallbackGeo.features || []) as any[]).map((feature) => ({
    code: feature.properties.code,
    name: feature.properties.name,
    prefecture_code: feature.properties.prefecture_code,
    rent_avg: feature.properties.rent_avg,
    population: feature.properties.population,
    area_km2: feature.properties.area_km2,
    geojson: feature.geometry as GeoJSON.GeoJsonObject
  }));
}
