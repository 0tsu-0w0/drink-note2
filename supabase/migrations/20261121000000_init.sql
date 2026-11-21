-- Mug & Glass 初期スキーマ

-- ============================================================
-- drinks: 1杯分の記録
-- ============================================================
create table if not exists public.drinks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  -- 端末側で採番する ID。オフライン記録の再送で二重登録しないために使う
  client_id     uuid not null default gen_random_uuid(),
  genre         text not null check (genre in ('cafe', 'alcohol')),
  kind          text not null,
  sub_kind      text,
  name          text not null check (char_length(name) between 1 and 100),
  -- 同じ銘柄の集計に使う正規化済みの名前（トリガーで埋める）
  name_key      text not null default '',
  rating        smallint check (rating is null or rating between 1 and 5),
  memo          text check (memo is null or char_length(memo) <= 500),
  flavors       text[] not null default '{}' check (cardinality(flavors) <= 30),
  origin        text check (origin is null or char_length(origin) <= 100),
  maker         text check (maker is null or char_length(maker) <= 100),
  place         text check (place is null or char_length(place) <= 100),
  abv           numeric(4,1) check (abv is null or (abv >= 0 and abv <= 99)),
  drank_at      timestamptz not null default now(),
  -- 記録画面を開いてから保存までの秒数（成功指標の計測用）
  entry_seconds integer check (entry_seconds is null or entry_seconds >= 0),
  visibility    text not null default 'private' check (visibility in ('private', 'unlisted')),
  hide_place    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, client_id),
  constraint drinks_kind_matches_genre check (
    (genre = 'cafe'    and kind in ('coffee', 'tea', 'other')) or
    (genre = 'alcohol' and kind in ('beer', 'sake', 'wine', 'whisky', 'shochu', 'sour', 'cocktail', 'other'))
  )
);

comment on table public.drinks is '1杯分の記録';

create index if not exists drinks_user_genre_drank_idx on public.drinks (user_id, genre, drank_at desc);
create index if not exists drinks_user_drank_idx       on public.drinks (user_id, drank_at desc);
create index if not exists drinks_user_namekey_idx     on public.drinks (user_id, name_key);

-- 名前の正規化: NFKC → 空白除去 → 小文字。アプリ側の normalizeName と同じ規則。
create or replace function public.drinks_before_write()
returns trigger
language plpgsql
as $$
begin
  new.name := btrim(new.name);
  new.name_key := lower(regexp_replace(normalize(new.name, NFKC), '\s+', '', 'g'));
  if tg_op = 'UPDATE' then
    new.updated_at := now();
    -- 計測値は最初の保存時のものだけを残す
    new.entry_seconds := old.entry_seconds;
  end if;
  return new;
end;
$$;

drop trigger if exists drinks_before_write on public.drinks;
create trigger drinks_before_write
  before insert or update on public.drinks
  for each row execute function public.drinks_before_write();

-- ============================================================
-- flavor_words: 自分で追加したフレーバーの言葉
-- ============================================================
create table if not exists public.flavor_words (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  genre      text not null check (genre in ('cafe', 'alcohol')),
  word       text not null check (char_length(word) between 1 and 30),
  created_at timestamptz not null default now(),
  primary key (user_id, genre, word)
);

-- ============================================================
-- 行レベルセキュリティ: 自分の行だけを読み書きできる
-- ============================================================
alter table public.drinks       enable row level security;
alter table public.flavor_words enable row level security;

drop policy if exists drinks_own on public.drinks;
create policy drinks_own on public.drinks
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists flavor_words_own on public.flavor_words;
create policy flavor_words_own on public.flavor_words
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ============================================================
-- アカウント削除: 本人の認証ユーザーを消す（記録は cascade で消える）
-- service_role キーをアプリに持たせずに済むよう、DB 側の関数で行う。
-- ============================================================
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
