import Link from "next/link";
import { kindLabel } from "@/lib/domain";
import { fmtTime, stars } from "@/lib/stats";
import type { Drink } from "@/lib/types";

export function DrinkRow({ d, showDay, fresh }: { d: Drink; showDay?: string; fresh?: boolean }) {
  const meta = [kindLabel(d.genre, d.kind), d.sub_kind, d.maker, d.place].filter(Boolean).join("・");
  return (
    <li>
      <Link href={`/d/${d.id}`} className={`drink-row g-${d.genre}${fresh ? " fresh" : ""}`} transitionTypes={["nav-forward"]}>
        <span className="bar" aria-hidden="true" />
        <span className="body">
          <span className="name" style={{ display: "block" }}>
            {d.name}
          </span>
          <span className="meta" style={{ display: "block" }}>
            {meta}
            {d.memo ? `　${d.memo}` : ""}
          </span>
        </span>
        <span className="right">
          {d.rating ? (
            <span className="stars-text" aria-label={`${d.rating}つ星`} style={{ display: "block" }}>
              {stars(d.rating)}
            </span>
          ) : null}
          <span className="num">{showDay ?? fmtTime(d.drank_at)}</span>
        </span>
      </Link>
    </li>
  );
}
