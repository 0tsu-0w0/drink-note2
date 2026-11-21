"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GENRES, isGenre, kindsOf, type Genre } from "@/lib/domain";
import { dayKey, fmtDay } from "@/lib/stats";
import type { Drink } from "@/lib/types";
import { DrinkRow } from "@/components/drink-row";
import { SearchIcon } from "@/components/icons";
import { DRINKS_CHANGED } from "@/components/toast";
import { DRINK_COLUMNS } from "@/lib/columns";

const PAGE = 30;

/** PostgREST の or() 構文を壊す文字を取り除く */
function cleanQuery(q: string) {
  return q.replace(/[,()*%\\"']/g, " ").trim().slice(0, 50);
}

export function HistoryView() {
  const router = useRouter();
  const params = useSearchParams();
  const genreParam = params.get("genre");
  const genre: Genre | null = isGenre(genreParam) ? genreParam : null;
  const kind = params.get("kind");
  const minRating = Number(params.get("rating") ?? 0) || 0;
  const qParam = params.get("q") ?? "";

  const [q, setQ] = useState(qParam);
  const [rows, setRows] = useState<Drink[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  const setParam = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") next.delete(k);
        else next.set(k, v);
      }
      router.replace(`/history${next.size ? `?${next}` : ""}`, { scroll: false });
    },
    [params, router],
  );

  /* 入力が止まってから検索する */
  useEffect(() => {
    if (q === qParam) return;
    const t = setTimeout(() => setParam({ q: q.trim() || null }), 300);
    return () => clearTimeout(t);
  }, [q, qParam, setParam]);

  const fetchPage = useCallback(
    async (offset: number) => {
      const id = ++reqId.current;
      setLoading(true);
      setError(null);
      let query = createClient()
        .from("drinks")
        .select(DRINK_COLUMNS)
        .order("drank_at", { ascending: false })
        .range(offset, offset + PAGE);
      if (genre) query = query.eq("genre", genre);
      if (genre && kind) query = query.eq("kind", kind);
      if (minRating) query = query.gte("rating", minRating);
      const term = cleanQuery(qParam);
      if (term) {
        const like = `%${term}%`;
        query = query.or(
          ["name", "origin", "maker", "place", "memo"].map((c) => `${c}.ilike.${like}`).join(","),
        );
      }
      const { data, error } = await query;
      if (id !== reqId.current) return;
      setLoading(false);
      if (error) {
        setError("読み込めませんでした。通信状態を確認してください。");
        return;
      }
      const list = (data ?? []) as unknown as Drink[];
      setHasMore(list.length > PAGE);
      const page = list.slice(0, PAGE);
      setRows((prev) => (offset === 0 ? page : [...prev, ...page]));
    },
    [genre, kind, minRating, qParam],
  );

  useEffect(() => {
    void fetchPage(0);
    const onChange = () => void fetchPage(0);
    window.addEventListener(DRINKS_CHANGED, onChange);
    return () => window.removeEventListener(DRINKS_CHANGED, onChange);
  }, [fetchPage]);

  /* 日付ごとにまとめる */
  const days: { key: string; label: string; items: Drink[] }[] = [];
  for (const d of rows) {
    const k = dayKey(d.drank_at);
    const last = days[days.length - 1];
    if (last && last.key === k) last.items.push(d);
    else days.push({ key: k, label: fmtDay(d.drank_at), items: [d] });
  }

  const filtered = !!(genre || minRating || qParam);

  return (
    <div className={`page ${genre ? `g-${genre}` : ""}`}>
      <div className="page-head">
        <h1 className="page-title">履歴</h1>
      </div>

      <div className="filters">
        <div className="search">
          <SearchIcon />
          <input
            className="input"
            type="search"
            enterKeyHint="search"
            value={q}
            placeholder="名前・お店・産地・メモで探す"
            aria-label="履歴を検索"
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="scroll-chips" role="group" aria-label="ジャンル">
          <button type="button" className="chip sm" aria-pressed={!genre} onClick={() => setParam({ genre: null, kind: null })}>
            すべて
          </button>
          {(Object.keys(GENRES) as Genre[]).map((g) => (
            <button
              key={g}
              type="button"
              className={`chip sm g-${g}`}
              aria-pressed={genre === g}
              onClick={() => setParam({ genre: genre === g ? null : g, kind: null })}
            >
              {GENRES[g].label}
            </button>
          ))}
          <button
            type="button"
            className="chip sm"
            aria-pressed={minRating === 4}
            onClick={() => setParam({ rating: minRating === 4 ? null : "4" })}
          >
            ★4以上
          </button>
        </div>
        {genre && (
          <div className="scroll-chips" role="group" aria-label="種類">
            {kindsOf(genre).map((k) => (
              <button
                key={k.key}
                type="button"
                className="chip sm"
                aria-pressed={kind === k.key}
                onClick={() => setParam({ kind: kind === k.key ? null : k.key })}
              >
                {k.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="errbox">{error}</p>}

      {!loading && rows.length === 0 && !error && (
        <p className="empty">{filtered ? "見つかりませんでした" : "まだ記録がありません"}</p>
      )}

      {days.map((day) => (
        <section key={day.key} aria-label={day.label}>
          <h2 className="day-head">{day.label}</h2>
          <ul className="drink-list">
            {day.items.map((d) => (
              <DrinkRow key={d.id} d={d} />
            ))}
          </ul>
        </section>
      ))}

      {hasMore && (
        <p style={{ textAlign: "center", marginTop: 16 }}>
          <button type="button" className="btn" disabled={loading} onClick={() => void fetchPage(rows.length)}>
            {loading ? "読み込み中…" : "もっと見る"}
          </button>
        </p>
      )}
      {loading && rows.length === 0 && <p className="empty">読み込み中…</p>}
    </div>
  );
}
