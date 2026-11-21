import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { supabaseEnv } from "./env";

export async function createClient() {
  const store = await cookies();
  const { url, key } = supabaseEnv();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(list) {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          /* Server Component からは書けない。proxy がセッションを更新する。 */
        }
      },
    },
  });
}

export type SessionUser = {
  id: string;
  email: string | null;
  isAnonymous: boolean;
  provider: string | null;
};

/**
 * ログイン中のユーザー。いなければ null。
 * getClaims は JWT の署名を検証する（非対称鍵ならネットワーク往復なし）。
 * 1回のリクエスト内では結果を使い回す。
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const c = data?.claims;
  const user: SessionUser | null =
    !error && c?.sub
      ? {
          id: c.sub,
          email: typeof c.email === "string" && c.email ? c.email : null,
          isAnonymous: c.is_anonymous === true,
          provider: (c.app_metadata as { provider?: string } | undefined)?.provider ?? null,
        }
      : null;
  return { supabase, user };
});
