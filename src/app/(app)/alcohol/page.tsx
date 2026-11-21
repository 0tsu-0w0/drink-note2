import { GenreHome } from "@/components/genre-home";
import { loadGenre } from "@/lib/load";

export const metadata = { title: "お酒" };

export default async function Page({ searchParams }: { searchParams: Promise<{ edit?: string; again?: string }> }) {
  const data = await loadGenre("alcohol", await searchParams);
  if (data.error) return <p className="errbox page">記録を読み込めませんでした：{data.error}</p>;
  return <GenreHome genre="alcohol" drinks={data.drinks} words={data.words} editing={data.editing} template={data.template} />;
}
