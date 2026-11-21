/**
 * Mug & Glass のドメイン定義。ジャンル・種類・細かい種類・フレーバーの正本。
 * DB の check 制約（drinks_kind_matches_genre）と揃えること。
 */

export type Genre = "cafe" | "alcohol";

export const GENRES: Record<Genre, { label: string; path: string }> = {
  cafe: { label: "カフェ", path: "/cafe" },
  alcohol: { label: "お酒", path: "/alcohol" },
};

export function isGenre(v: unknown): v is Genre {
  return v === "cafe" || v === "alcohol";
}

export type KindDef = {
  key: string;
  label: string;
  subs: string[];
  flavors: string[];
  /** 作り手の欄の見出し */
  makerLabel: string;
  /** 名前の欄に薄く出す例 */
  namePh: string;
};

export const KINDS: Record<Genre, KindDef[]> = {
  cafe: [
    {
      key: "coffee",
      label: "コーヒー",
      subs: ["ドリップ", "エスプレッソ", "ラテ", "アメリカーノ", "水出し", "缶・ボトル"],
      flavors: ["フルーティ", "柑橘", "ベリー", "フローラル", "チョコ", "ナッツ", "キャラメル", "香ばしい", "酸味強め", "苦味強め"],
      makerLabel: "お店・焙煎所",
      namePh: "エチオピア イルガチェフェ",
    },
    {
      key: "tea",
      label: "紅茶",
      subs: ["ストレート", "ミルク", "レモン", "アイス", "チャイ", "フレーバー"],
      flavors: ["華やか", "マスカット", "フルーティ", "花の香り", "スモーキー", "まろやか", "渋み", "コク", "すっきり", "甘い余韻"],
      makerLabel: "お店・ブランド",
      namePh: "ダージリン",
    },
    {
      key: "other",
      label: "その他",
      subs: [],
      flavors: ["甘い", "すっきり", "濃い", "香ばしい", "フルーティ", "さっぱり", "まろやか", "苦い"],
      makerLabel: "お店・メーカー",
      namePh: "ほうじ茶ラテ",
    },
  ],
  alcohol: [
    {
      key: "beer",
      label: "ビール",
      subs: ["ラガー", "ピルスナー", "IPA", "ペールエール", "ヴァイツェン", "スタウト"],
      flavors: ["キレ", "苦味", "ホップ", "麦の甘み", "フルーティ", "柑橘", "華やか", "まろやか", "ロースト", "軽い"],
      makerLabel: "醸造所・メーカー",
      namePh: "ペールエール",
    },
    {
      key: "sake",
      label: "日本酒",
      subs: ["純米", "純米吟醸", "純米大吟醸", "本醸造", "生酒", "にごり"],
      flavors: ["辛口", "甘口", "フルーティ", "華やか", "米の旨み", "キレ", "まろやか", "酸味", "すっきり", "熟成香"],
      makerLabel: "蔵元",
      namePh: "純米吟醸 ○○",
    },
    {
      key: "wine",
      label: "ワイン",
      subs: ["赤", "白", "ロゼ", "スパークリング"],
      flavors: ["辛口", "甘口", "果実味", "ベリー", "柑橘", "樽", "渋み", "酸味", "ミネラル", "軽やか"],
      makerLabel: "生産者",
      namePh: "シャブリ",
    },
    {
      key: "whisky",
      label: "ウイスキー",
      subs: ["スコッチ", "バーボン", "ジャパニーズ", "アイリッシュ", "ハイボール"],
      flavors: ["スモーキー", "ピート", "バニラ", "樽", "フルーティ", "ハチミツ", "スパイシー", "まろやか", "キレ", "甘い"],
      makerLabel: "蒸溜所",
      namePh: "白州",
    },
    {
      key: "shochu",
      label: "焼酎",
      subs: ["芋", "麦", "米", "黒糖", "泡盛"],
      flavors: ["香ばしい", "甘い", "すっきり", "まろやか", "キレ", "華やか", "芋の香り", "コク", "軽い", "熟成"],
      makerLabel: "蔵元",
      namePh: "芋焼酎 ○○",
    },
    {
      key: "sour",
      label: "サワー・チューハイ",
      subs: ["レモン", "グレープフルーツ", "梅", "ライム", "その他果実"],
      flavors: ["すっきり", "甘い", "酸っぱい", "果汁感", "苦味", "強炭酸", "軽い", "濃い"],
      makerLabel: "お店・メーカー",
      namePh: "レモンサワー",
    },
    {
      key: "cocktail",
      label: "カクテル",
      subs: ["ショート", "ロング", "ノンアル"],
      flavors: ["甘い", "すっきり", "酸味", "苦味", "フルーティ", "ハーブ", "強め", "軽め"],
      makerLabel: "お店",
      namePh: "ジントニック",
    },
    {
      key: "other",
      label: "その他",
      subs: [],
      flavors: ["甘い", "辛口", "すっきり", "フルーティ", "まろやか", "強め", "軽め"],
      makerLabel: "お店・メーカー",
      namePh: "梅酒",
    },
  ],
};

export function kindsOf(genre: Genre): KindDef[] {
  return KINDS[genre];
}

export function kindOf(genre: Genre, key: string | null | undefined): KindDef {
  const list = KINDS[genre];
  return list.find((k) => k.key === key) ?? list[list.length - 1];
}

export function kindLabel(genre: string, key: string): string {
  return isGenre(genre) ? kindOf(genre, key).label : key;
}

/** DB の name_key と同じ規則（NFKC → 空白除去 → 小文字） */
export function normalizeName(name: string): string {
  return name.trim().normalize("NFKC").replace(/\s+/g, "").toLowerCase();
}
