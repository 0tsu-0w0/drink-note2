import { GenreHome } from "@/components/genre-home";
import { loadGenre } from "@/lib/load";
import { PageTransition } from "@/components/page-transition";

export const metadata = { title: "お酒" };

export default async function Page({ searchParams }: { searchParams: Promise<{ edit?: string; again?: string }> }) {
  const data = await loadGenre("alcohol", await searchParams);
  if (data.error) return <p className="errbox page">記録を読み込めませんでした。通信状態を確認して、開き直してください。</p>;
  return (
    <PageTransition>
      <GenreHome genre="alcohol" drinks={data.drinks} words={data.words} editing={data.editing} template={data.template} />
    </PageTransition>
  );
}
