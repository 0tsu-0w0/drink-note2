import Link from "next/link";

export default function NotFound() {
  return (
    <main className="welcome">
      <h1 className="page-title">ページが見つかりません</h1>
      <Link href="/" className="btn btn-block">トップへ</Link>
    </main>
  );
}
