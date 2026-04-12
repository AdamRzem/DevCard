-- Migration: Add card view-count RPC for public card read flow
-- Date: 2026-04-12
-- Author: database-engineer agent
-- Locking: Function DDL acquires catalog-level locks only; no table rewrite.
-- Reversible: Yes (drop function).
-- Estimated duration: Fast (<1s)

-- UP
create or replace function public.increment_card_view_count(p_slug text)
returns integer
language plpgsql
set search_path = public
as $$
declare
  v_view_count integer;
begin
  update public.cards
  set view_count = view_count + 1
  where slug = lower(trim(p_slug))
    and is_public = true
  returning view_count into v_view_count;

  return coalesce(v_view_count, 0);
end;
$$;
