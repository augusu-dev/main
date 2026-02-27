# 全国家賃ヒートマップ (Next.js + Supabase)

Next.js 14 (App Router) + Supabase を使った、市区町村別の家賃ヒートマップ/掲示板アプリの実装土台です。

## セットアップ

```bash
npm install
npm run dev
```

`.env.example` を `.env.local` にコピーして環境変数を設定してください。

## Supabase 手動セットアップ

1. Supabase で新規プロジェクト作成
2. `supabase/schema.sql` を SQL Editor で実行
3. Authentication で Email/Password を有効化
4. Vercel 側に以下の環境変数を登録
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ESTAT_API_KEY`

## データパイプライン

- 市区町村 GeoJSON 取得: `python3 scripts/fetch_geojson.py`
- e-Stat 家賃データ取得: `python3 scripts/fetch_rent_data.py --api-key <ESTAT_API_KEY>`
- Supabase 取り込み: `python3 scripts/import_to_supabase.py`

## 主要ページ

- `/` 全国地図 + サイドバー + 検索
- `/[city_code]` 市区町村詳細
- `/board/[city_code]` ログイン必須掲示板（Realtime 更新）
- `/auth` ログイン / 登録

## 既存ポータル

`index.html` は AUGUSU LAB ポータルとして残し、新しい Next.js アプリへの導線を追加しています。

### Vercel デプロイ時の注意

`vercel.json` では `@secret_name` 形式の参照を使っていません。  
Vercel Dashboard の **Project Settings → Environment Variables** に、次のキーを直接登録してください。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ESTAT_API_KEY`

> もし `Environment Variable "NEXT_PUBLIC_SUPABASE_URL" references Secret "next_public_supabase_url" ...` のエラーが出る場合は、
> 以前の `vercel.json` / ダッシュボード設定で `@next_public_supabase_url` 参照が残っている可能性があります。
> 参照を削除して、値を直接設定し直してください。
