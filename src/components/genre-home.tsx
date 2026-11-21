"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GENRES, type Genre } from "@/lib/domain";
import { fmtDay, ranking, stars, weekSummary } from "@/lib/stats";
import type { Drink } from "@/lib/types";
import { DrinkRow } from "@/components/drink-row";
import { RecordSheet } from "@/components/record-sheet";
import { GearIcon, PlusIcon } from "@/components/icons";

type Props = {
  genre: Genre;
  drinks: Drink[];
  words: string[];
  editing: Drink | null;
  template: Drink | null;
};

export function GenreHome({ genre, drinks, words, editing, template }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(!!(editing || template));
  const [sheetSrc, setSheetSrc] = useState({ editing, template });
  /* 週の区切りは端末のタイムゾーンで計算するため、描画後に決める */
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  useEffect(() => {
    if (editing || template) {
      setSheetSrc({ editing, template });
      setOpen(true);
    }
  }, [editing, template]);

  const close = useCallback(() => {
    setOpen(false);
    if (sheetSrc.editing || sheetSrc.template) {
      setSheetSrc({ editing: null, template: null });
      router.replace(GENRES[genre].path, { scroll: false });
    }
  }, [genre, router, sheetSrc]);

  const week = useMemo(() => (now ? weekSummary(drinks, now) : null), [drinks, now]);
  const top = useMemo(() => ranking(drinks), [drinks]);
  const recent = drinks.slice(0, 8);

  return (
    <div className={`page g-${genre}`}>
      <div className="page-head">
        <h1 className="page-title">{GENRES[genre].label}</h1>
        <Link href="/settings" className="iconlink" aria-label="設定">
          <GearIcon />
        </Link>
      </div>

      <section aria-label="今週のまとめ">
        <div className="summary">
          <div className="cell">
            <div className="k">今週</div>
            <div className="v num">{week ? `${week.count}杯` : "–"}</div>
          </div>
          <div className="cell">
            <div className="k">よく飲んだ</div>
            <div className="v small">{week?.topKind ?? "–"}</div>
          </div>
          <div className="cell">
            <div className="k">いちばん</div>
            <div className="v small">
              {week?.best ? (
                <Link href={`/d/${week.best.id}`} style={{ textDecoration: "none" }}>
                  {week.best.name}
                </Link>
              ) : (
                "–"
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="h-recent">
        <h2 className="section-title" id="h-recent">
          最近の記録
        </h2>
        {recent.length === 0 ? (
          <p className="empty">
            まだ記録がありません。
            <br />
            右下の「記録する」から始めましょう。
          </p>
        ) : (
          <>
            <ul className="drink-list">
              {recent.map((d) => (
                <DrinkRow key={d.id} d={d} showDay={now ? fmtDay(d.drank_at, now) : ""} />
              ))}
            </ul>
            {drinks.length > recent.length && (
              <p style={{ textAlign: "center", margin: "8px 0 0" }}>
                <Link href={`/history?genre=${genre}`} className="linkbtn" style={{ textDecoration: "none", display: "inline-block" }}>
                  すべて見る
                </Link>
              </p>
            )}
          </>
        )}
      </section>

      {top.length > 0 && (
        <section className="section" aria-labelledby="h-top">
          <h2 className="section-title" id="h-top">
            よく飲むもの
          </h2>
          <ol className="drink-list">
            {top.map((c) => (
              <li key={c.latest.name_key}>
                <Link href={`/history?q=${encodeURIComponent(c.latest.name)}&genre=${genre}`} className={`drink-row g-${genre}`}>
                  <span className="bar" aria-hidden="true" />
                  <span className="body">
                    <span className="name" style={{ display: "block" }}>
                      {c.latest.name}
                    </span>
                    <span className="meta" style={{ display: "block" }}>
                      {c.count}回{c.avg ? `・平均 ${c.avg.toFixed(1)}` : ""}
                    </span>
                  </span>
                  <span className="right">
                    <span className="stars-text">{c.avg ? stars(Math.round(c.avg)) : ""}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!open && (
        <button type="button" className="fab" onClick={() => setOpen(true)}>
          <PlusIcon />
          記録する
        </button>
      )}

      {open && (
        <RecordSheet
          key={sheetSrc.editing?.id ?? sheetSrc.template?.id ?? "new"}
          genre={genre}
          drinks={drinks}
          words={words}
          editing={sheetSrc.editing}
          template={sheetSrc.template}
          onClose={close}
        />
      )}
    </div>
  );
}
