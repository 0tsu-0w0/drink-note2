import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import type { Genre } from "@/lib/domain";
import type { Drink } from "@/lib/types";

import { DRINK_COLUMNS } from "@/lib/columns";
export { DRINK_COLUMNS };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID.test(v);
}

/** ジャンルのタブに必要なデータ。候補と集計は直近300件から作る */
export async function loadGenre(genre: Genre, params: { edit?: string; again?: string }) {
  const { supabase, user } = await getUser();
  if (!user) redirect("/");

  const targetId = isUuid(params.edit) ? params.edit : isUuid(params.again) ? params.again : null;

  const [drinksRes, wordsRes] = await Promise.all([
    supabase.from("drinks").select(DRINK_COLUMNS).eq("genre", genre).order("drank_at", { ascending: false }).limit(300),
    supabase.from("flavor_words").select("word").eq("genre", genre).order("created_at").limit(200),
  ]);
  const drinks = (drinksRes.data ?? []) as unknown as Drink[];
  const words = (wordsRes.data ?? []).map((w: { word: string }) => w.word);

  let target: Drink | null = null;
  if (targetId) {
    target = drinks.find((d) => d.id === targetId) ?? null;
    if (!target) {
      const { data } = await supabase.from("drinks").select(DRINK_COLUMNS).eq("id", targetId).eq("genre", genre).maybeSingle();
      target = (data as unknown as Drink | null) ?? null;
    }
  }

  return {
    drinks,
    words,
    editing: isUuid(params.edit) ? target : null,
    template: !isUuid(params.edit) && isUuid(params.again) ? target : null,
    error: drinksRes.error ? true : false,
  };
}
