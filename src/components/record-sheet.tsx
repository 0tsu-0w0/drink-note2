"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GENRES, kindOf, kindsOf, normalizeName, type Genre } from "@/lib/domain";
import { candidates, fmtDate, groupByName, stars } from "@/lib/stats";
import type { Drink } from "@/lib/types";
import { useToast } from "@/components/toast";

type Props = {
  genre: Genre;
  /** このジャンルの記録（新しい順）。候補と回数の計算に使う */
  drinks: Drink[];
  /** 自分で足したフレーバーの言葉 */
  words: string[];
  /** 編集する記録 */
  editing?: Drink | null;
  /** 「もう一度」の元になる記録 */
  template?: Drink | null;
  onClose: () => void;
};

function toLocalInput(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function emptyToNull(s: string): string | null {
  const t = s.trim();
  return t ? t : null;
}

export function RecordSheet({ genre, drinks, words: initialWords, editing, template, onClose }: Props) {
  const router = useRouter();
  const toast = useToast();
  const openedAt = useRef(Date.now());
  const src = editing ?? template ?? null;

  const lastKind = drinks[0]?.kind;
  const [kind, setKind] = useState<string>(src?.kind ?? lastKind ?? kindsOf(genre)[0].key);
  const [name, setName] = useState(src?.name ?? "");
  const [rating, setRating] = useState<number>(editing?.rating ?? 0);
  const [memo, setMemo] = useState(editing?.memo ?? "");
  const [subKind, setSubKind] = useState<string | null>(src?.sub_kind ?? null);
  const [flavors, setFlavors] = useState<string[]>(src?.flavors ?? []);
  const [origin, setOrigin] = useState(src?.origin ?? "");
  const [maker, setMaker] = useState(src?.maker ?? "");
  const [place, setPlace] = useState(src?.place ?? "");
  const [abv, setAbv] = useState(src?.abv != null ? String(src.abv) : "");
  const [when, setWhen] = useState(toLocalInput(editing ? new Date(editing.drank_at) : new Date()));
  const [showWhen, setShowWhen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [words, setWords] = useState(initialWords);
  const [wordDraft, setWordDraft] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const def = kindOf(genre, kind);
  const groups = useMemo(() => groupByName(drinks), [drinks]);
  const quick = useMemo(() => (src ? [] : candidates(drinks)), [drinks, src]);

  const nameKey = normalizeName(name);
  const suggestions = useMemo(() => {
    if (!nameKey || !nameFocused) return [];
    return [...groups.values()]
      .filter((g) => g.latest.name_key.includes(nameKey) && g.latest.name_key !== nameKey)
      .slice(0, 5);
  }, [groups, nameKey, nameFocused]);

  const detailCount =
    (subKind ? 1 : 0) + (flavors.length ? 1 : 0) + [origin, maker, place, abv].filter((v) => v.trim()).length;

  /* 背景のスクロールを止め、Esc で閉じる */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function applyFrom(d: Drink) {
    setKind(d.kind);
    setName(d.name);
    setSubKind(d.sub_kind);
    setFlavors(d.flavors ?? []);
    setOrigin(d.origin ?? "");
    setMaker(d.maker ?? "");
    setPlace(d.place ?? "");
    setAbv(d.abv != null ? String(d.abv) : "");
    setNameFocused(false);
  }

  function changeKind(next: string) {
    if (next === kind) return;
    setKind(next);
    /* 名前・★・メモは残す。種類に紐づく細かい種類とフレーバーだけ外す（F-12） */
    setSubKind(null);
    const nextDef = kindOf(genre, next);
    setFlavors((prev) => prev.filter((f) => nextDef.flavors.includes(f) || words.includes(f)));
  }

  function toggleFlavor(f: string) {
    setFlavors((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  async function addWord() {
    const w = wordDraft.trim().slice(0, 30);
    if (!w) return;
    setWordDraft("");
    if (!flavors.includes(w)) setFlavors((prev) => [...prev, w]);
    if (def.flavors.includes(w) || words.includes(w)) return;
    setWords((prev) => [...prev, w]);
    await createClient().from("flavor_words").upsert({ genre, word: w }, { onConflict: "user_id,genre,word" });
  }

  async function save() {
    setError(null);
    if (!name.trim()) {
      setError("名前を入れてください");
      return;
    }
    const abvNum = abv.trim() ? Number(abv) : null;
    if (abvNum != null && (!Number.isFinite(abvNum) || abvNum < 0 || abvNum > 99)) {
      setError("度数は0〜99の数字で入れてください");
      return;
    }
    const drankAt = showWhen || editing ? new Date(when) : new Date();
    if (Number.isNaN(drankAt.getTime())) {
      setError("日時を確認してください");
      return;
    }

    const row = {
      genre,
      kind,
      sub_kind: subKind,
      name: name.trim(),
      rating: rating || null,
      memo: emptyToNull(memo),
      flavors,
      origin: emptyToNull(origin),
      maker: emptyToNull(maker),
      place: emptyToNull(place),
      abv: genre === "alcohol" ? abvNum : null,
      drank_at: drankAt.toISOString(),
    };
    const supabase = createClient();

    if (editing) {
      setSaving(true);
      const { error } = await supabase.from("drinks").update(row).eq("id", editing.id);
      setSaving(false);
      if (error) {
        setError("保存できませんでした。通信状態を確認してください。");
        return;
      }
      toast.show({ title: "保存しました" });
      onClose();
      router.refresh();
      return;
    }

    /* 新規: 通信を待たずに閉じて結果を見せる（F-26） */
    const past = groups.get(normalizeName(row.name));
    const nth = (past?.count ?? 0) + 1;
    const sub =
      past && past.latest.rating
        ? `前回は${stars(past.latest.rating)}（${fmtDate(past.latest.drank_at)}）`
        : past
          ? `前回は${fmtDate(past.latest.drank_at)}`
          : "はじめての記録です";
    const clientId = crypto.randomUUID();
    const entrySeconds = Math.round((Date.now() - openedAt.current) / 1000);
    onClose();
    toast.show({ title: `${row.name}　${nth}回目`, sub, ms: 4500 });

    const insert = async () => {
      const { error } = await supabase
        .from("drinks")
        .upsert({ ...row, client_id: clientId, entry_seconds: entrySeconds }, { onConflict: "user_id,client_id" });
      if (error) {
        toast.show({
          title: "保存できませんでした",
          sub: "通信状態を確認してください",
          ms: 10000,
          action: { label: "再試行", run: () => void insert() },
        });
        return;
      }
      router.refresh();
    };
    await insert();
  }

  const title = editing ? "記録を直す" : `${GENRES[genre].label}を記録`;

  return (
    <div className={`sheet-backdrop g-${genre}`} onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-head">
          <h2 id="sheet-title">{title}</h2>
          <button type="button" className="linkbtn" onClick={onClose}>
            閉じる
          </button>
        </div>

        <div className="sheet-body">
          {error && <p className="errbox">{error}</p>}

          {quick.length > 0 && (
            <div className="field">
              <span className="label">よく飲むもの・最近のもの</span>
              <div className="quick">
                {quick.map((c) => (
                  <button
                    key={c.latest.id}
                    type="button"
                    aria-pressed={nameKey === c.latest.name_key}
                    onClick={() => applyFrom(c.latest)}
                  >
                    <span className="qn">{c.latest.name}</span>
                    <span className="qm">
                      {kindOf(genre, c.latest.kind).label}・{c.count}回
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="field">
            <span className="label" id="lbl-kind">
              種類
            </span>
            <div className="chips" role="group" aria-labelledby="lbl-kind">
              {kindsOf(genre).map((k) => (
                <button
                  key={k.key}
                  type="button"
                  className="chip"
                  aria-pressed={kind === k.key}
                  onClick={() => changeKind(k.key)}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="rs-name">
              名前<span className="req">必須</span>
            </label>
            <input
              id="rs-name"
              className="input"
              type="text"
              autoComplete="off"
              enterKeyHint="done"
              maxLength={100}
              value={name}
              placeholder={def.namePh}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setTimeout(() => setNameFocused(false), 150)}
            />
            {suggestions.length > 0 && (
              <ul className="suggest" aria-label="過去の記録から">
                {suggestions.map((g) => (
                  <li key={g.latest.id}>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFrom(g.latest)}>
                      {g.latest.name} <span className="muted">・{g.count}回</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="field">
            <span className="label" id="lbl-rating">
              好み
            </span>
            <div className="stars" role="radiogroup" aria-labelledby="lbl-rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n}つ星`}
                  className={n <= rating ? "on" : ""}
                  onClick={() => setRating(rating === n ? 0 : n)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="rs-memo">
              ひとこと
            </label>
            <textarea
              id="rs-memo"
              className="textarea"
              maxLength={500}
              value={memo}
              placeholder="酸味がちょうどいい"
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <div className="field">
            {showWhen || editing ? (
              <>
                <label className="label" htmlFor="rs-when">
                  飲んだ日時
                </label>
                <input
                  id="rs-when"
                  className="input"
                  type="datetime-local"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                />
              </>
            ) : (
              <div>
                <span className="muted">日時：いま</span>
                <button type="button" className="linkbtn" onClick={() => setShowWhen(true)}>
                  日時を変える
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="more-toggle"
            aria-expanded={showMore}
            aria-controls="rs-details"
            onClick={() => setShowMore((v) => !v)}
          >
            <span>
              詳しく書く
              {detailCount > 0 && !showMore && <span className="muted">（{detailCount}項目入力済み）</span>}
            </span>
            <span aria-hidden="true">{showMore ? "−" : "＋"}</span>
          </button>

          {showMore && (
            <div className="details" id="rs-details">
              {def.subs.length > 0 && (
                <div className="field">
                  <span className="label" id="lbl-sub">
                    細かい種類
                  </span>
                  <div className="chips" role="group" aria-labelledby="lbl-sub">
                    {def.subs.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="chip sm"
                        aria-pressed={subKind === s}
                        onClick={() => setSubKind(subKind === s ? null : s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="field">
                <span className="label" id="lbl-flavor">
                  味・香り
                </span>
                <div className="chips" role="group" aria-labelledby="lbl-flavor">
                  {[...def.flavors, ...words.filter((w) => !def.flavors.includes(w))].map((f) => (
                    <button
                      key={f}
                      type="button"
                      className="chip sm"
                      aria-pressed={flavors.includes(f)}
                      onClick={() => toggleFlavor(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="addword">
                  <input
                    className="input"
                    type="text"
                    maxLength={30}
                    value={wordDraft}
                    placeholder="言葉を追加"
                    aria-label="味・香りの言葉を追加"
                    onChange={(e) => setWordDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        void addWord();
                      }
                    }}
                  />
                  <button type="button" className="btn" onClick={() => void addWord()}>
                    追加
                  </button>
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="rs-maker">
                  {def.makerLabel}
                </label>
                <input id="rs-maker" className="input" type="text" maxLength={100} value={maker} onChange={(e) => setMaker(e.target.value)} />
              </div>

              <div className={genre === "alcohol" ? "row2" : ""}>
                <div className="field">
                  <label className="label" htmlFor="rs-origin">
                    産地
                  </label>
                  <input
                    id="rs-origin"
                    className="input"
                    type="text"
                    maxLength={100}
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </div>
                {genre === "alcohol" && (
                  <div className="field">
                    <label className="label" htmlFor="rs-abv">
                      度数（%）
                    </label>
                    <input
                      id="rs-abv"
                      className="input"
                      type="text"
                      inputMode="decimal"
                      value={abv}
                      onChange={(e) => setAbv(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="field">
                <label className="label" htmlFor="rs-place">
                  飲んだ場所
                </label>
                <input
                  id="rs-place"
                  className="input"
                  type="text"
                  maxLength={100}
                  value={place}
                  placeholder="自宅、店名"
                  onChange={(e) => setPlace(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="sheet-foot">
          <button type="button" className="btn btn-primary btn-block" disabled={saving} onClick={() => void save()}>
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
