# アウグスのメイン実験室

## 東京都 市区町村別 平均賃貸マップ

静的な `index.html` で動作する、東京都の市区町村別平均賃貸の可視化ツールです。

## まず結論（404 のときはここだけ）

`index.html` は **このリポジトリ直下に存在** します。  
起動前に「そのフォルダにいるか」を必ず確認してください。

## `dir` に `index.html` が出ない場合（重要）

`README.md` と `node_modules` しか見えない場合は、次のどれかが原因です。

1. **別フォルダ**を開いている（同名フォルダ違い）
2. **別ブランチ**にいる（例: `sub1`）
3. `index.html` がローカルで削除されている

以下を順番に実行してください。

### Windows PowerShell / CMD

```bat
cd [あなたが開いている augusu-main]
git rev-parse --show-toplevel
git branch --show-current
git ls-files | findstr index.html
```

- `git ls-files` に `index.html` が出る → ファイルを復元:

```bat
git checkout -- index.html serve.py README.md
```

- `git ls-files` に `index.html` が出ない → 最新を取得:

```bat
git fetch --all
git pull
```

### sub1 ブランチを使っている場合（即復旧）

`sub1` に `index.html` が無い場合は、**`work` ブランチに切り替え**るのが最短です。

```bat
git checkout work
git pull
```

## 起動手順（Windows）

```bat
cd [プロジェクトフォルダのパス]
dir
python -m http.server 8000
```

ブラウザ:

- `http://localhost:8000/index.html`

## 起動手順（macOS / Linux）

```bash
cd /path/to/augusu-main
ls
python3 -m http.server 8000
```

ブラウザ:

- `http://localhost:8000/index.html`

## 追加の確実手段（このリポジトリ専用）

```bash
python3 serve.py --port 8000
```

`serve.py` はリポジトリ直下を配信するので、カレントディレクトリ由来の 404 を避けやすいです。

## 機能

- 市区町村ごとの平均賃料を色分けしたタイル型マップ
- ホバーで右パネルに詳細表示（ランキング、地域紹介、人口、アクセス指数など）
- 詳細パネルはスクロール対応

> 注: 現在の数値はデモ用です。実データに差し替えることで本番利用できます。
