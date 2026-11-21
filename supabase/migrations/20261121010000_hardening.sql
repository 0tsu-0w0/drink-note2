-- セキュリティと負荷の上限

-- 計測値は 0〜1日（86400秒）まで。極端な値で集計を壊されないように
alter table public.drinks drop constraint if exists drinks_entry_seconds_check;
alter table public.drinks add constraint drinks_entry_seconds_check
  check (entry_seconds is null or (entry_seconds between 0 and 86400));

-- 日時は 2000年以降（未来すぎる日時はトリガーで弾く。check 制約に now() は使えないため）
alter table public.drinks add constraint drinks_drank_at_min
  check (drank_at >= '2000-01-01');

-- 公開機能（第2段階）を作るまでは private 以外を受け付けない
alter table public.drinks add constraint drinks_private_until_sharing
  check (visibility = 'private') not valid;

-- フレーバーの言葉は1人1ジャンル 100 個まで
create or replace function public.flavor_words_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.flavor_words where user_id = new.user_id and genre = new.genre) >= 100 then
    raise exception 'flavor_words limit reached';
  end if;
  return new;
end;
$$;

drop trigger if exists flavor_words_limit on public.flavor_words;
create trigger flavor_words_limit
  before insert on public.flavor_words
  for each row execute function public.flavor_words_limit();

-- 書き込み時の整形と検査。search_path を固定する（Supabase の advisor 指摘対策）
create or replace function public.drinks_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.drank_at > now() + interval '1 day' then
    raise exception 'drank_at is too far in the future';
  end if;
  new.name := btrim(new.name);
  new.name_key := lower(regexp_replace(normalize(new.name, NFKC), '\s+', '', 'g'));
  if tg_op = 'UPDATE' then
    new.updated_at := now();
    new.entry_seconds := old.entry_seconds;
  end if;
  return new;
end;
$$;

-- anon ロールからは何も触れない（RLS に加えて権限でも閉じる）
revoke all on public.drinks from anon;
revoke all on public.flavor_words from anon;
