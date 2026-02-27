import Link from 'next/link';
import { getMunicipalities } from '@/lib/data';
import HomeShell from '@/components/map/HomeShell';

export default async function HomePage() {
  const municipalities = await getMunicipalities();

  return (
    <main className="p-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">全国家賃ヒートマップ</h1>
        <Link href="/auth" className="rounded bg-blue-600 px-3 py-2 text-white">
          ログイン / 登録
        </Link>
      </header>
      <HomeShell municipalities={municipalities} />
    </main>
  );
}
