import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import type { Genre } from "@/lib/domain";
import type { Drink } from "@/lib/types";

/** ジャンルのタブに必要なデータ。候補と集計は直近300件から作る */
export async function loadGenre(genre: Genre, params: { edit?: string; again?: string }) {
  const { supabase, user } = await getUser();
  if (!user) redirect("/");

  const [drinksRes, wordsRes] = await Promise.all([
    supabase.from("drinks").select("*").eq("genre", genre).order("drank_at", { ascending: false }).limit(300),
    supabase.from("flavor_words").select("word").eq("genre", genre).order("created_at"),
  ]);
  const drinks = (drinksRes.data ?? []) as Drink[];
  const words = (wordsRes.data ?? []).map((w: { word: string }) => w.word);

  const pick = async (id?: string) => {
    if (!id) return null;
    const hit = drinks.find((d) => d.id === id);
    if (hit) return hit;
    const { data } = await supabase.from("drinks").select("*").eq("id", id).eq("genre", genre).maybeSingle();
    return (data as Drink | null) ?? null;
  };

  return {
    drinks,
    words,
    editing: await pick(params.edit),
    template: await pick(params.again),
    error: drinksRes.error?.message ?? null,
  };
}
