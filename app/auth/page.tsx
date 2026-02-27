'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function signIn() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setMessage('Supabase環境変数が未設定です。');
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : 'ログインしました。');
  }

  async function signUp() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setMessage('Supabase環境変数が未設定です。');
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? error.message : '登録メールを送信しました。');
  }

  return (
    <main className="mx-auto mt-12 max-w-md rounded border bg-white p-6">
      <h1 className="mb-4 text-xl font-bold">ログイン / 登録</h1>
      <div className="space-y-3">
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="email@example.com" className="w-full rounded border p-2" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="password" className="w-full rounded border p-2" />
        <div className="flex gap-2">
          <button onClick={signIn} className="rounded bg-blue-600 px-3 py-2 text-white">ログイン</button>
          <button onClick={signUp} className="rounded border px-3 py-2">新規登録</button>
        </div>
        {message && <p className="text-sm">{message}</p>}
      </div>
    </main>
  );
}
