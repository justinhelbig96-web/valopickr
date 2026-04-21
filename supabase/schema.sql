-- ValoMatePicker — Supabase SQL Schema
-- Ausführen in: Supabase Dashboard → SQL Editor

-- Profiles Tabelle
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  bio text,
  riot_name text,
  riot_tag text,
  rank text,                    -- z.B. "Gold 2"
  rank_tier text,               -- z.B. "gold"
  peak_rank text,
  agent_mains text[],           -- Favoriten-Agenten
  discord_tag text,
  region text default 'eu',     -- eu, na, ap, kr
  avatar_url text,
  looking_for_rank_min text,    -- Filter: Mindest-Rank
  looking_for_rank_max text,    -- Filter: Max-Rank
  last_synced_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Valorant Stats Cache
create table if not exists valorant_stats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade unique,
  wins integer default 0,
  losses integer default 0,
  kd_ratio numeric(4,2) default 0,
  headshot_rate numeric(5,2) default 0,
  avg_score integer default 0,
  matches_played integer default 0,
  playtime_hours integer default 0,
  updated_at timestamptz default now()
);

-- Swipes Tabelle
create table if not exists swipes (
  id uuid default gen_random_uuid() primary key,
  from_user_id uuid references profiles(id) on delete cascade,
  to_user_id uuid references profiles(id) on delete cascade,
  direction text check (direction in ('left', 'right')) not null,
  created_at timestamptz default now(),
  unique(from_user_id, to_user_id)
);

-- Matches Tabelle
create table if not exists matches (
  id uuid default gen_random_uuid() primary key,
  user1_id uuid references profiles(id) on delete cascade,
  user2_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user1_id, user2_id)
);

-- Messages Tabelle
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references matches(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- RLS aktivieren
alter table profiles enable row level security;
alter table valorant_stats enable row level security;
alter table swipes enable row level security;
alter table matches enable row level security;
alter table messages enable row level security;

-- Profiles: jeder kann Profile lesen, nur eigenes bearbeiten
create policy "Profiles sind öffentlich lesbar" on profiles for select using (true);
create policy "Nutzer kann eigenes Profil bearbeiten" on profiles for update using (auth.uid() = id);
create policy "Nutzer kann eigenes Profil anlegen" on profiles for insert with check (auth.uid() = id);

-- Stats: jeder kann Stats lesen
create policy "Stats sind öffentlich lesbar" on valorant_stats for select using (true);
create policy "Nur Service-Role kann Stats schreiben" on valorant_stats for all using (true);

-- Swipes: nur eigene sehen
create policy "Nutzer sieht eigene Swipes" on swipes for select using (auth.uid() = from_user_id);
create policy "Nutzer kann swipen" on swipes for insert with check (auth.uid() = from_user_id);

-- Matches: beide User sehen den Match
create policy "Matches sind für beteiligte sichtbar" on matches for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- Messages: nur Beteiligte im Match
create policy "Nachrichten für Match-Beteiligte" on messages for select
  using (
    exists (
      select 1 from matches m
      where m.id = match_id
      and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );
create policy "Nachrichten senden" on messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from matches m
      where m.id = match_id
      and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

-- Funktion: Profil beim Registrieren automatisch anlegen
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Migration: Social Links (run once in Supabase SQL Editor)
alter table profiles add column if not exists instagram_url text;
alter table profiles add column if not exists reddit_url text;
alter table profiles add column if not exists github_url text;
