import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/supabase/env";
import { LAST_TAB_COOKIE } from "@/lib/flags";

const PROTECTED = ["/cafe", "/alcohol", "/history", "/settings", "/d/"];

/** セッションを更新し、ログインが要る画面を守る */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { url, key } = supabaseEnv();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(list) {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });

  /* getClaims は必要ならトークンを更新し、署名を検証する */
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims?.sub ? data.claims : null;
  const path = request.nextUrl.pathname;

  const redirect = (to: string) => {
    const dest = request.nextUrl.clone();
    dest.pathname = to;
    dest.search = "";
    const res = NextResponse.redirect(dest);
    for (const c of response.cookies.getAll()) res.cookies.set(c);
    return res;
  };

  if (!user && PROTECTED.some((p) => path === p || path.startsWith(p.endsWith("/") ? p : p + "/"))) {
    return redirect("/");
  }

  if (user && path === "/") {
    const last = request.cookies.get(LAST_TAB_COOKIE)?.value;
    return redirect(last === "alcohol" ? "/alcohol" : last === "history" ? "/history" : "/cafe");
  }

  /* 最後に開いたタブを覚えておく（F-11） */
  const tab = path === "/cafe" ? "cafe" : path === "/alcohol" ? "alcohol" : path === "/history" ? "history" : null;
  if (user && tab) {
    response.cookies.set(LAST_TAB_COOKIE, tab, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api/|manifest.webmanifest|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
