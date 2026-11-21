import { kindLabel, normalizeName } from "@/lib/domain";
import type { Drink } from "@/lib/types";

const WD = ["日", "月", "火", "水", "木", "金", "土"];

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** 「今日」「昨日」「11/18（火）」 */
export function fmtDay(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diff = Math.round((b - a) / 86400000);
  if (diff === 0) return "今日";
  if (diff === 1) return "昨日";
  const y = d.getFullYear() !== now.getFullYear() ? `${d.getFullYear()}/` : "";
  return `${y}${d.getMonth() + 1}/${d.getDate()}（${WD[d.getDay()]}）`;
}

export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function stars(n: number | null | undefined): string {
  return n ? "★".repeat(n) : "";
}

/** 今週の月曜 0:00（端末のタイムゾーン） */
export function startOfWeek(now = new Date()): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d;
}

export type WeekSummary = {
  count: number;
  topKind: string | null;
  best: Drink | null;
};

export function weekSummary(drinks: Drink[], now = new Date()): WeekSummary {
  const from = startOfWeek(now).getTime();
  const week = drinks.filter((d) => new Date(d.drank_at).getTime() >= from);
  const kinds = new Map<string, number>();
  for (const d of week) kinds.set(d.kind, (kinds.get(d.kind) ?? 0) + 1);
  let topKind: string | null = null;
  let topN = 0;
  for (const [k, n] of kinds) {
    if (n > topN) {
      topKind = k;
      topN = n;
    }
  }
  let best: Drink | null = null;
  for (const d of week) {
    if (d.rating && (!best || (best.rating ?? 0) < d.rating)) best = d;
  }
  return {
    count: week.length,
    topKind: topKind && week[0] ? kindLabel(week[0].genre, topKind) : null,
    best,
  };
}

export type Candidate = { latest: Drink; count: number };

/** 銘柄ごとにまとめる（drinks は新しい順で渡す） */
export function groupByName(drinks: Drink[]): Map<string, Candidate> {
  const map = new Map<string, Candidate>();
  for (const d of drinks) {
    const key = d.name_key || normalizeName(d.name);
    const hit = map.get(key);
    if (hit) hit.count += 1;
    else map.set(key, { latest: d, count: 1 });
  }
  return map;
}

/**
 * 記録画面に出す候補（最大 limit 件）。
 * 最近飲んだもの上位3件を先に置き、残りを回数の多い順で埋める。
 */
export function candidates(drinks: Drink[], limit = 6): Candidate[] {
  const groups = [...groupByName(drinks).values()];
  const out: Candidate[] = [];
  const used = new Set<string>();
  for (const c of groups.slice(0, 3)) {
    out.push(c);
    used.add(c.latest.name_key);
  }
  const byCount = groups
    .filter((c) => !used.has(c.latest.name_key))
    .sort((a, b) => b.count - a.count || b.latest.drank_at.localeCompare(a.latest.drank_at));
  for (const c of byCount) {
    if (out.length >= limit) break;
    out.push(c);
  }
  return out;
}

/** よく飲むもの（回数順） */
export function ranking(drinks: Drink[], limit = 5) {
  /* 1回なめるだけで ★の合計と件数を集める */
  const sums = new Map<string, { sum: number; n: number }>();
  for (const d of drinks) {
    if (!d.rating) continue;
    const s = sums.get(d.name_key) ?? { sum: 0, n: 0 };
    s.sum += d.rating;
    s.n += 1;
    sums.set(d.name_key, s);
  }
  return [...groupByName(drinks).values()]
    .filter((c) => c.count >= 2)
    .map((c) => {
      const s = sums.get(c.latest.name_key);
      return { ...c, avg: s ? s.sum / s.n : null };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
