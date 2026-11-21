# 本番公開の手順（Supabase + Google ログイン + Vercel）

所要時間の目安：30〜40分。すべて無料プランで足ります。

## 1. Supabase（本番用）

1. Supabase で新しいプロジェクトを作る（リージョンは Tokyo）。
   - 無料プランで同時に動かせるプロジェクトは2つまで。空きがなければ、使っていないプロジェクトを一時停止する。
2. `supabase/migrations/` の2ファイルを、**日付の古い順に**適用する。
   - SQL Editor に中身を貼って実行する、または Claude に頼む（Supabase の接続を使って適用できる）。
3. **Authentication → Sign In / Providers**
   - **Anonymous sign-ins：オフ**（開発用ログインの入口。本番では必ずオフ）
   - **Email：オフ**（このアプリはメールログインを使わない）
4. **Project Settings → API Keys** で、Project URL と Publishable key を控える。

## 2. Google ログイン

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作る。
2. **Google Auth Platform → ブランディング**
   - アプリ名：Mug & Glass
   - サポートメール：自分のアドレス
   - プライバシーポリシー：`https://<本番URL>/privacy`
   - 利用規約：`https://<本番URL>/terms`
3. **対象**：外部 →「アプリを公開」（テスト中のままだと、登録した100人までしか使えない）。
4. **クライアント** → 作成 → 種類「ウェブ アプリケーション」
   - 承認済みのリダイレクト URI：`https://<SupabaseのプロジェクトID>.supabase.co/auth/v1/callback`
5. 発行されたクライアントIDとシークレットを、Supabase の **Authentication → Sign In / Providers → Google** に貼り、有効にする。

## 3. Vercel

1. Vercel で **Add New → Project** → GitHub の `drink-note2` を選ぶ。
2. **Deploy を押す前に**、Environment Variables に次を入れる。

| 名前 | 値 |
| :-- | :-- |
| `NEXT_PUBLIC_SUPABASE_URL` | 1-4 で控えた Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 1-4 で控えた Publishable key |
| `NEXT_PUBLIC_SITE_URL` | いったん空でよい（3-4 で入れる） |
| `NEXT_PUBLIC_ENABLE_GOOGLE` | `1` |
| `NEXT_PUBLIC_ENABLE_APPLE` | `0` |
| `NEXT_PUBLIC_DEV_LOGIN` | `0` |
| `CRON_SECRET` | 長いランダム文字列（休止対策の定期アクセス用） |

3. Deploy する。
4. 発行された URL（`https://xxxx.vercel.app`）を `NEXT_PUBLIC_SITE_URL` に入れ、**Redeploy** する（`NEXT_PUBLIC_` の値はビルド時に埋め込まれるため）。
5. Supabase の **Authentication → URL Configuration**
   - Site URL：本番 URL
   - Redirect URLs：`https://xxxx.vercel.app/auth/callback`

## 4. スマホで確認

1. スマホで本番 URL を開き、Google でログインする。
2. iPhone：共有 →「ホーム画面に追加」／Android：メニュー →「ホーム画面に追加」。
3. **ホーム画面のアイコンから開き直して、ログインが保たれているか確認する**（要件のリスク R-1）。

## 公開前チェック

| 項目 | あるべき状態 |
| :-- | :-- |
| 匿名ログイン | Supabase でオフ |
| `NEXT_PUBLIC_DEV_LOGIN` | `0`（本番ビルドでは仮に `1` でも表示されない） |
| service_role / secret キー | どこにも置いていない |
| RLS | `drinks` と `flavor_words` で有効 |
| Redirect URLs | 本番の `/auth/callback` だけ |
