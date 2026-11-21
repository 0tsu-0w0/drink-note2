# Mug & Glass

コーヒー・紅茶とお酒を、10秒で記録する飲み物ログ。要件は [docs/requirements.md](./docs/requirements.md)。

| レイヤ | 技術 |
| :-- | :-- |
| Frontend | Next.js 16（App Router）、React 19 |
| DB / 認証 | Supabase（PostgreSQL + Auth、RLS） |
| スタイル | 素の CSS（`src/app/globals.css`）。ライト／ダーク対応 |

## ローカルで動かす

必要なもの：Node.js 22 以上、Docker

```bash
npm install
```

```bash
npm run db:start
```

ローカルの Supabase が起動し、`supabase/migrations/` が適用されます。
出力の `PUBLISHABLE_KEY`（または `ANON_KEY`）を控えます。

```bash
cp .env.example .env.local
```

`.env.local` の `NEXT_PUBLIC_SUPABASE_ANON_KEY` に控えたキーを入れます。

```bash
npm run dev
```

<http://localhost:3000> を開き、「開発用ログイン」で入れます（Supabase の匿名ログインを使い、このブラウザだけで有効）。

止めるとき：

```bash
npm run db:stop
```

## ログイン方法の切り替え

| 変数 | 内容 |
| :-- | :-- |
| `NEXT_PUBLIC_DEV_LOGIN` | `1` で開発用ログインを表示。**本番では必ず `0`** |
| `NEXT_PUBLIC_ENABLE_GOOGLE` | `1` で Google ログインを表示 |
| `NEXT_PUBLIC_ENABLE_APPLE` | `1` で Apple ログインを表示（Apple Developer Program 登録後） |

### Google ログインをローカルで試す

1. Google Cloud Console で OAuth クライアント（ウェブアプリ）を作り、承認済みのリダイレクト URI に `http://127.0.0.1:54321/auth/v1/callback` を登録
2. `supabase/.env`（git 管理外）に `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` と `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` を書く
3. `supabase/config.toml` の `[auth.external.google]` を `enabled = true` にして `npm run db:stop && npm run db:start`
4. `.env.local` を `NEXT_PUBLIC_ENABLE_GOOGLE=1` にする

Apple も同じ手順で `[auth.external.apple]` を有効にします。

## 構成

```
src/
├── app/
│   ├── page.tsx              # ようこそ（ログイン）
│   ├── (app)/                # ログイン後の画面（下のタブ付き）
│   │   ├── cafe/ alcohol/    # ジャンルのタブ
│   │   ├── history/          # 履歴・検索
│   │   ├── d/[id]/           # 記録の詳細
│   │   └── settings/
│   ├── auth/callback/        # OAuth の戻り先
│   ├── api/keepalive/        # Supabase 休止対策（Vercel Cron）
│   ├── terms/ privacy/
│   ├── manifest.ts           # PWA
│   └── icons/[size]/         # PWA 用 PNG アイコン
├── components/
│   ├── record-sheet.tsx      # 記録の入力（かんたん＋詳しく書く）
│   ├── genre-home.tsx        # まとめ・最近・よく飲むもの
│   └── history-view.tsx
├── lib/
│   ├── domain.ts             # ジャンル・種類・フレーバーの正本
│   ├── stats.ts              # 候補・週のまとめ・ランキング
│   └── supabase/
└── proxy.ts                  # セッション更新・保護ルート・最後のタブ
supabase/migrations/          # スキーマと RLS
```
