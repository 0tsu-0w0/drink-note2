import Link from "next/link";
import { flags } from "@/lib/flags";
import { LoginButtons } from "@/components/login-buttons";

export default async function Welcome({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="welcome">
      <div>
        <h1 className="wordmark">
          <span className="m">Mug</span> <span className="amp">&amp;</span> <span className="g">Glass</span>
        </h1>
        <p className="lead">飲んだコーヒーとお酒を、10秒で記録。</p>
      </div>
      {error && <p className="errbox">ログインできませんでした。もう一度お試しください。</p>}
      <LoginButtons google={flags.google} apple={flags.apple} devLogin={flags.devLogin} />
      <p className="fineprint">
        続けると<Link href="/terms">利用規約</Link>と<Link href="/privacy">プライバシーポリシー</Link>に同意したことになります。
      </p>
    </main>
  );
}
