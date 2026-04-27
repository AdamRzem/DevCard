-- =============================================
-- DevCard — Supabase Initial Schema
-- =============================================
-- Paste this entire file into Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Run)
-- =============================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- =====================
-- USERS TABLE
-- =====================
create table if not exists public.users (
  id              uuid primary key default gen_random_uuid(),
  github_id       text not null unique,
  github_username text not null unique,
  display_name    text,
  avatar_url      text,
  bio             text,
  email           text,
  company         text,
  location        text,
  card_theme      text not null default 'dark-minimal',
  card_layout     text not null default 'full',
  is_public       boolean not null default false,
  view_count      integer not null default 0,
  github_data     jsonb,
  last_fetched_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =====================
-- CARDS TABLE
-- =====================
create table if not exists public.cards (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  slug            text not null unique,
  theme           text not null default 'dark-minimal',
  layout          text not null default 'full',
  sections        text[] not null default array['bio','stats','languages','repos'],
  custom_colors   jsonb not null default '{}',
  is_public       boolean not null default true,
  storage_path    text,           -- Supabase Storage object path for the card PNG
  view_count      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =====================
-- INDEXES
-- =====================
-- cards_slug_idx is intentionally omitted: the UNIQUE constraint on slug already creates an index.
create index if not exists cards_user_id_idx on public.cards(user_id);
-- users_github_username_idx is intentionally omitted: the UNIQUE constraint already creates an index.

-- =====================
-- ROW LEVEL SECURITY
-- =====================
alter table public.users enable row level security;
alter table public.cards enable row level security;

-- Users: readable by anyone if is_public
create policy "Public users are viewable by everyone"
  on public.users for select
  using (is_public = true);

-- Cards: public cards are viewable by anyone
create policy "Public cards are viewable by everyone"
  on public.cards for select
  using (is_public = true);

-- Service role bypasses RLS for all server-side writes
-- (All API routes use the service-role key, so no user-scoped policies needed for writes)

-- =====================
-- UPDATED_AT TRIGGER
-- =====================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger cards_updated_at
  before update on public.cards
  for each row execute procedure public.handle_updated_at();

-- =====================
-- RPC: INCREMENT VIEW COUNT
-- =====================
-- Used by the public profile page to count recruiter views
create or replace function public.increment_user_view_count(p_github_id text)
returns void language plpgsql security definer
set search_path = public
as $$
begin
  update public.users
  set view_count = view_count + 1
  where github_id = p_github_id;
end;
$$;

-- Restrict execution to service_role only (server-side calls); revoke from PUBLIC.
revoke execute on function public.increment_user_view_count(text) from public;
grant execute on function public.increment_user_view_count(text) to service_role;
