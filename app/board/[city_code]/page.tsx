import Link from 'next/link';
import BoardClient from '@/components/board/BoardClient';

export default function BoardPage({ params }: { params: { city_code: string } }) {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{params.city_code} 掲示板</h1>
        <Link href={`/${params.city_code}`} className="rounded border px-3 py-2">
          詳細へ戻る
        </Link>
      </div>
      <BoardClient cityCode={params.city_code} />
    </main>
  );
}
