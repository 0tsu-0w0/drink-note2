import type { Genre } from "@/lib/domain";

/** drinks テーブルの1行 */
export type Drink = {
  id: string;
  user_id: string;
  client_id: string;
  genre: Genre;
  kind: string;
  sub_kind: string | null;
  name: string;
  name_key: string;
  rating: number | null;
  memo: string | null;
  flavors: string[];
  origin: string | null;
  maker: string | null;
  place: string | null;
  abv: number | null;
  drank_at: string;
  entry_seconds: number | null;
  visibility: "private" | "unlisted";
  hide_place: boolean;
  created_at: string;
  updated_at: string;
};

/** フォームから保存する値 */
export type DrinkInput = Pick<
  Drink,
  "genre" | "kind" | "sub_kind" | "name" | "rating" | "memo" | "flavors" | "origin" | "maker" | "place" | "abv" | "drank_at"
>;
