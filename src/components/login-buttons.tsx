"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = { google: boolean; apple: boolean; devLogin: boolean };

export function LoginButtons({ google, apple, devLogin }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function oauth(provider: "google" | "apple") {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("ログインを始められませんでした。時間をおいてもう一度お試しください。");
      setBusy(false);
    }
  }

  async function dev() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      setError(`開発用ログインに失敗しました：${error.message}`);
      setBusy(false);
      return;
    }
    router.replace("/cafe");
    router.refresh();
  }

  return (
    <div className="login-buttons">
      {error && <p className="errbox">{error}</p>}
      {google && (
        <button type="button" className="btn btn-block" disabled={busy} onClick={() => oauth("google")}>
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          Googleでログイン
        </button>
      )}
      {apple && (
        <button type="button" className="btn btn-block" disabled={busy} onClick={() => oauth("apple")}>
          <svg width="18" height="20" viewBox="0 0 17 20" aria-hidden="true" fill="currentColor">
            <path d="M13.6 10.6c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-1.9-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9C3.3 4.9 1.7 5.9.8 7.4c-1.8 3.1-.5 7.8 1.3 10.3.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.4-.8s2 .8 3.4.8c1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-3-4.3zM11.1 3.2c.7-.8 1.2-2 1-3.2-1 0-2.3.7-3 1.5-.7.8-1.3 2-1.1 3.1 1.1.1 2.3-.6 3.1-1.4z" />
          </svg>
          Appleでログイン
        </button>
      )}
      {devLogin && (
        <button type="button" className="btn btn-block btn-primary" disabled={busy} onClick={dev}>
          開発用ログイン（このブラウザだけ）
        </button>
      )}
      {!google && !apple && !devLogin && (
        <p className="errbox">ログイン方法が設定されていません。.env.local を確認してください。</p>
      )}
    </div>
  );
}
