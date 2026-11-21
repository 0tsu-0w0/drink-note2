import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/supabase/env";

/**
 * Supabase 無料プランは7日ほどアクセスがないと休止する。
 * Vercel Cron から1日1回呼び、DB まで問い合わせを届けて休止を防ぐ。
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { url, key } = supabaseEnv();
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  /* RLS で中身は空になる。DB まで届けば十分。 */
  const { error } = await supabase.from("drinks").select("id", { head: true, count: "exact" }).limit(1);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
