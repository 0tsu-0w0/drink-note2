import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { SettingsView } from "@/components/settings-view";
import { PageTransition } from "@/components/page-transition";

export const metadata = { title: "設定" };

export default async function Page() {
  const { user } = await getUser();
  if (!user) redirect("/");
  const provider = user.isAnonymous ? "開発用ログイン" : (user.provider ?? "");
  const label = provider === "google" ? "Google" : provider === "apple" ? "Apple" : provider;
  return (
    <PageTransition>
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">設定</h1>
      </div>
      <SettingsView account={user.email || label} provider={label} />
      <p className="fineprint section">
        <Link href="/terms">利用規約</Link>・<Link href="/privacy">プライバシーポリシー</Link>
      </p>
    </div>
    </PageTransition>
  );
}
