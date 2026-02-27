'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { BoardPost } from '@/lib/types';

export default function BoardClient({ cityCode }: { cityCode: string }) {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    supabase
      .from('posts')
      .select('*')
      .eq('municipality_code', cityCode)
      .order('created_at', { ascending: false })
      .then(({ data }) => setPosts((data as BoardPost[]) || []));

    const channel = supabase
      .channel(`posts-${cityCode}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts', filter: `municipality_code=eq.${cityCode}` },
        () => {
          supabase
            .from('posts')
            .select('*')
            .eq('municipality_code', cityCode)
            .order('created_at', { ascending: false })
            .then(({ data }) => setPosts((data as BoardPost[]) || []));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cityCode]);

  async function submitPost() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const supabase = createClient();
    if (!userId || !content.trim()) return;
    if (content.length > 1000) return;

    await supabase.from('posts').insert({ municipality_code: cityCode, user_id: userId, content });
    setContent('');
  }

  async function deletePost(id: number) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const supabase = createClient();
    await supabase.from('posts').delete().eq('id', id);
  }

  return (
    <section className="space-y-4">
      <div className="rounded border bg-white p-4">
        {!userId && <p className="text-sm text-red-600">投稿にはログインが必要です。</p>}
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={1000}
          className="mt-2 w-full rounded border p-2"
          rows={4}
          placeholder="1000文字以内で投稿内容を入力"
        />
        <div className="mt-2 flex items-center justify-between text-sm">
          <span>{content.length} / 1000</span>
          <button onClick={submitPost} disabled={!userId || !content.trim()} className="rounded bg-blue-600 px-3 py-2 text-white disabled:bg-slate-400">投稿する</button>
        </div>
      </div>

      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.id} className="rounded border bg-white p-4">
            <p className="whitespace-pre-wrap text-sm">{post.content}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{new Date(post.created_at).toLocaleString('ja-JP')}</span>
              {post.user_id === userId && <button onClick={() => deletePost(post.id)} className="rounded border px-2 py-1">削除</button>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
