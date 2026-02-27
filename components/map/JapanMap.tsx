'use client';

import { MapContainer, GeoJSON, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Municipality } from '@/lib/types';
import { rentToColor } from '@/lib/rent';

type Props = {
  municipalities: Municipality[];
  onSelect: (item: Municipality) => void;
  query: string;
};

export default function JapanMap({ municipalities, onSelect, query }: Props) {
  const normalized = query.trim().toLowerCase();
  const filtered = municipalities.filter((m) =>
    normalized ? m.name.toLowerCase().includes(normalized) : true
  );

  return (
    <MapContainer center={[36.2, 138.25]} zoom={5} className="map-pane w-full rounded-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {filtered.map((item) => (
        <GeoJSON
          key={item.code}
          data={item.geojson as GeoJSON.GeoJsonObject}
          style={{ color: '#374151', weight: 0.8, fillColor: rentToColor(item.rent_avg), fillOpacity: 0.7 }}
          eventHandlers={{
            click: () => onSelect(item)
          }}
        />
      ))}
    </MapContainer>
  );
}
