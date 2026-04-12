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
  update public.cards c
  set view_count = c.view_count + 1
  from public.users u
  where c.user_id = u.id
    and c.slug = lower(trim(p_slug))
    and c.is_public = true
    and u.is_public = true
  returning c.view_count into v_view_count;

  return coalesce(v_view_count, 0);
end;
$$;

-- Restrict execution to service_role only; revoke from PUBLIC.
revoke execute on function public.increment_card_view_count(text) from public;
grant execute on function public.increment_card_view_count(text) to service_role;
