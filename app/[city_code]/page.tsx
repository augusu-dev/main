import Link from 'next/link';
import { getMunicipalities } from '@/lib/data';

export default async function CityDetailPage({ params }: { params: { city_code: string } }) {
  const municipalities = await getMunicipalities();
  const city = municipalities.find((item) => item.code === params.city_code);

  if (!city) {
    return <main className="p-6">該当する市区町村が見つかりませんでした。</main>;
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">{city.name}</h1>
      <div className="space-y-2 rounded border bg-white p-4">
        <p>市区町村コード: {city.code}</p>
        <p>平均家賃: {city.rent_avg ? `${city.rent_avg.toLocaleString()} 円` : '未設定'}</p>
        <p>人口: {city.population?.toLocaleString() ?? '未設定'} 人</p>
        <p>面積: {city.area_km2?.toLocaleString() ?? '未設定'} km²</p>
      </div>
      <div className="mt-4 flex gap-3">
        <Link href={`/board/${city.code}`} className="rounded bg-blue-600 px-3 py-2 text-white">
          掲示板へ
        </Link>
        <Link href="/" className="rounded border px-3 py-2">
          地図に戻る
        </Link>
      </div>
    </main>
  );
}
