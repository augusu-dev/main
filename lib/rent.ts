export function rentToColor(rent: number | null): string {
  if (!rent) return '#d1d5db';
  if (rent < 40000) return '#dbeafe';
  if (rent < 60000) return '#93c5fd';
  if (rent < 80000) return '#60a5fa';
  if (rent < 100000) return '#3b82f6';
  return '#1d4ed8';
}
