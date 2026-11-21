"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Theme = "system" | "light" | "dark";

export function SettingsView({ account, provider }: { account: string; provider: string }) {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("system");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem("mg_theme");
      if (t === "light" || t === "dark") setTheme(t);
    } catch {}
  }, []);

  function applyTheme(t: Theme) {
    setTheme(t);
    try {
      if (t === "system") localStorage.removeItem("mg_theme");
      else localStorage.setItem("mg_theme", t);
    } catch {}
    if (t === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
  }

  async function signOut() {
    setBusy(true);
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  async function deleteAccount() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_my_account");
    if (error) {
      setBusy(false);
      setError("削除できませんでした。時間をおいてもう一度お試しください。");
      return;
    }
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="settings-list">
      <section className="card">
        <h2 className="section-title">表示</h2>
        <div className="chips" role="radiogroup" aria-label="テーマ">
          {(
            [
              ["system", "自動"],
              ["light", "ライト"],
              ["dark", "ダーク"],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" role="radio" className="chip" aria-checked={theme === k} aria-pressed={theme === k} onClick={() => applyTheme(k)}>
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">アカウント</h2>
        <p style={{ margin: "0 0 12px", overflowWrap: "anywhere" }}>
          {account}
          {provider && account !== provider && <span className="muted">（{provider}）</span>}
        </p>
        <button type="button" className="btn btn-block" disabled={busy} onClick={() => void signOut()}>
          ログアウト
        </button>
      </section>

      <section className="card danger-zone">
        <h2 className="section-title">アカウントの削除</h2>
        {error && <p className="errbox">{error}</p>}
        {confirming ? (
          <>
            <p style={{ marginTop: 0 }}>すべての記録が消え、元に戻せません。本当に削除しますか？</p>
            <div className="actions">
              <button type="button" className="btn btn-danger" disabled={busy} onClick={() => void deleteAccount()}>
                削除する
              </button>
              <button type="button" className="btn" disabled={busy} onClick={() => setConfirming(false)}>
                やめる
              </button>
            </div>
          </>
        ) : (
          <button type="button" className="btn btn-block btn-danger" onClick={() => setConfirming(true)}>
            アカウントを削除
          </button>
        )}
      </section>
    </div>
  );
}
