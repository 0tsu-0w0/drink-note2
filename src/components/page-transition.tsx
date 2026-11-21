import { ViewTransition } from "react";

/**
 * 画面の出入りの動き。遷移の種類（transitionTypes）で向きを変える。
 * - tab-left / tab-right : タブの切り替え（並び順に合わせて横に流す）
 * - nav-forward / nav-back : 一覧 → 詳細、詳細 → 一覧
 * 種類のない遷移（ブラウザの戻る・refresh）は動かさない。
 */
const MAP = {
  "tab-left": "tab-left",
  "tab-right": "tab-right",
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter={MAP} exit={MAP} default="none">
      {children}
    </ViewTransition>
  );
}

export const TAB_ORDER = ["/cafe", "/alcohol", "/history"];

/** 今いるタブから行き先のタブへの向き */
export function tabDirection(from: string, to: string): string[] {
  const a = TAB_ORDER.indexOf(from);
  const b = TAB_ORDER.indexOf(to);
  if (a < 0 || b < 0 || a === b) return a < 0 && b >= 0 ? ["nav-back"] : [];
  return [b > a ? "tab-left" : "tab-right"];
}
