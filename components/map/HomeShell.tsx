'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Municipality } from '@/lib/types';

const JapanMap = dynamic(() => import('./JapanMap'), { ssr: false });

export default function HomeShell({ municipalities }: { municipalities: Municipality[] }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Municipality | null>(municipalities[0] ?? null);

  const stats = useMemo(() => {
    const rentValues = municipalities.map((x) => x.rent_avg).filter((x): x is number => !!x);
    const avg = rentValues.length
      ? Math.round(rentValues.reduce((sum, value) => sum + value, 0) / rentValues.length)
      : 0;

    return { count: municipalities.length, avg };
  }, [municipalities]);

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-3 flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded border p-2"
            placeholder="市区町村名で検索"
          />
          <div className="rounded border bg-white px-3 py-2 text-sm">{stats.count} 自治体</div>
          <div className="rounded border bg-white px-3 py-2 text-sm">平均 {stats.avg.toLocaleString()} 円</div>
        </div>
        <JapanMap municipalities={municipalities} onSelect={setSelected} query={query} />
      </div>
      <aside className="rounded border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">市区町村詳細</h2>
        {!selected && <p>地図をクリックして選択してください。</p>}
        {selected && (
          <div className="space-y-2 text-sm">
            <p className="font-semibold">{selected.name}</p>
            <p>コード: {selected.code}</p>
            <p>平均家賃: {selected.rent_avg ? `${selected.rent_avg.toLocaleString()} 円` : '未設定'}</p>
            <p>人口: {selected.population?.toLocaleString() ?? '未設定'} 人</p>
            <p>面積: {selected.area_km2?.toLocaleString() ?? '未設定'} km²</p>
            <Link
              href={`/${selected.code}`}
              className="mt-2 inline-block rounded bg-slate-900 px-3 py-2 text-white"
            >
              詳細ページへ
            </Link>
          </div>
        )}
      </aside>
    </section>
  );
}
