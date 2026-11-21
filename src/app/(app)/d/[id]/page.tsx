import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { GENRES, kindLabel } from "@/lib/domain";
import type { Drink } from "@/lib/types";
import { DRINK_COLUMNS, isUuid } from "@/lib/load";
import { DetailActions } from "@/components/detail-actions";
import { DetailWhen } from "@/components/detail-when";
import { PageTransition } from "@/components/page-transition";

export const metadata = { title: "記録" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { supabase, user } = await getUser();
  if (!user) redirect("/");
  const { data } = await supabase.from("drinks").select(DRINK_COLUMNS).eq("id", id).maybeSingle();
  const d = data as unknown as Drink | null;
  if (!d) notFound();

  const { count } = await supabase
    .from("drinks")
    .select("id", { count: "exact", head: true })
    .eq("name_key", d.name_key);

  const rows: [string, React.ReactNode][] = [];
  if (d.sub_kind) rows.push(["細かい種類", d.sub_kind]);
  if (d.maker) rows.push(["作り手・お店", d.maker]);
  if (d.origin) rows.push(["産地", d.origin]);
  if (d.abv != null) rows.push(["度数", `${d.abv}%`]);
  if (d.place) rows.push(["飲んだ場所", d.place]);

  return (
    <PageTransition>
    <div className={`page g-${d.genre}`}>
      <div className="page-head">
        <Link href="/history" className="linkbtn" style={{ textDecoration: "none" }} transitionTypes={["nav-back"]}>
          ‹ 履歴
        </Link>
      </div>

      <p className="detail-meta">
        {GENRES[d.genre].label}・{kindLabel(d.genre, d.kind)}
      </p>
      <h1 className="detail-name">{d.name}</h1>
      <p className="detail-meta">
        <DetailWhen iso={d.drank_at} />
        {count && count > 1 ? `・これまで${count}回` : ""}
      </p>
      {d.rating ? (
        <p className="stars-text" style={{ fontSize: 28, margin: "8px 0" }} aria-label={`${d.rating}つ星`}>
          {"★".repeat(d.rating)}
          <span style={{ color: "var(--line)" }}>{"★".repeat(5 - d.rating)}</span>
        </p>
      ) : null}
      {d.memo && <p style={{ whiteSpace: "pre-wrap", fontSize: 17 }}>{d.memo}</p>}

      {d.flavors.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {d.flavors.map((f) => (
            <span className="tag" key={f}>
              {f}
            </span>
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <dl className="dl card section">
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: "contents" }}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="section">
        <DetailActions drink={d} />
      </div>
    </div>
    </PageTransition>
  );
}
