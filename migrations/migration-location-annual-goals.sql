-- ════════════════════════════════════════════════════════════════════
-- MyClubTracker — Multi-year goal storage (Step 6A.1)
-- Run this once in Supabase SQL Editor.
-- Safe to re-run.
-- ════════════════════════════════════════════════════════════════════
--
-- Why this exists:
--   The first goals migration added two columns to public.locations
--   (annual_sales_goal, annual_dv_goal) which can only hold one year of
--   goals at a time. The dashboard's year picker requires Mary to set 2027
--   goals while 2026 is still active, and to look back at 2025 once it
--   exists, which a single-year-per-row column design can't represent.
--
-- What this does:
--   1. Creates public.location_annual_goals keyed by (location_id, year)
--   2. Enables RLS with a single permissive policy covering admins,
--      org_leaders within the same org, and owners of the location
--   3. Backfills 2026 goals from the legacy columns into the new table
--
-- The legacy columns on public.locations stay in place for now. They
-- become read-stale once the modal is updated to write to the new table
-- only, but nothing else in the app reads them. They can be dropped in
-- a cleanup migration after Step 6A.2 ships clean.
-- ════════════════════════════════════════════════════════════════════

-- 1. Create table -----------------------------------------------------

create table if not exists public.location_annual_goals (
  location_id uuid not null references public.locations(id) on delete cascade,
  year        int  not null check (year >= 2020 and year <= 2100),
  sales_goal  numeric,
  dv_goal     int,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (location_id, year)
);

-- Helps "all clubs in org for year X" queries that filter on year first.
create index if not exists idx_location_annual_goals_year
  on public.location_annual_goals(year);

-- updated_at auto-tick on UPDATE
create or replace function public.tg_location_annual_goals_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists location_annual_goals_touch_updated_at
  on public.location_annual_goals;

create trigger location_annual_goals_touch_updated_at
  before update on public.location_annual_goals
  for each row execute function public.tg_location_annual_goals_touch_updated_at();


-- 2. RLS --------------------------------------------------------------

alter table public.location_annual_goals enable row level security;

-- Single permissive policy covering SELECT/INSERT/UPDATE/DELETE.
-- Permitted actors:
--   - admins (anywhere)
--   - org_leaders whose users.org_id matches the location's org_id
--   - owners whose users.location_id is the location row in question
-- The WITH CHECK clause uses the same condition, so an actor cannot
-- "move" a goal row to a location they don't control.
drop policy if exists "location_annual_goals_full_access"
  on public.location_annual_goals;

create policy "location_annual_goals_full_access"
on public.location_annual_goals
for all
to authenticated
using (
  exists (
    select 1
    from public.users u
    join public.locations l on l.id = location_annual_goals.location_id
    where u.id = auth.uid()
      and u.deleted_at is null
      and (
        u.role = 'admin'
        or (u.role = 'org_leader' and u.org_id = l.org_id)
        or (u.role = 'owner'      and u.location_id = l.id)
      )
  )
)
with check (
  exists (
    select 1
    from public.users u
    join public.locations l on l.id = location_annual_goals.location_id
    where u.id = auth.uid()
      and u.deleted_at is null
      and (
        u.role = 'admin'
        or (u.role = 'org_leader' and u.org_id = l.org_id)
        or (u.role = 'owner'      and u.location_id = l.id)
      )
  )
);


-- 3. Backfill 2026 ----------------------------------------------------

-- Copy any non-null legacy goal values into the new table for 2026.
-- ON CONFLICT keeps re-runs safe and lets the latest legacy value win
-- if you re-run after editing legacy columns directly (you shouldn't).
insert into public.location_annual_goals (location_id, year, sales_goal, dv_goal)
select id,
       2026,
       annual_sales_goal,
       annual_dv_goal
from public.locations
where annual_sales_goal is not null
   or annual_dv_goal is not null
on conflict (location_id, year) do update
  set sales_goal = excluded.sales_goal,
      dv_goal    = excluded.dv_goal,
      updated_at = now();


-- ════════════════════════════════════════════════════════════════════
-- Verify:
--   select location_id, year, sales_goal, dv_goal
--   from public.location_annual_goals
--   order by year, location_id;
--
--   Should return one row per club that had a goal saved yesterday,
--   with year = 2026.
-- ════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════
-- Rollback (only if needed):
--   drop table if exists public.location_annual_goals cascade;
--   drop function if exists public.tg_location_annual_goals_touch_updated_at();
-- ════════════════════════════════════════════════════════════════════
