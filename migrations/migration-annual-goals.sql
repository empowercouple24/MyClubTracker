-- ════════════════════════════════════════════════════════════════════
-- MyClubTracker — Annual sales & DV goals (per-club)
-- Run this once in Supabase SQL Editor.
-- Safe to re-run.
-- ════════════════════════════════════════════════════════════════════
--
-- Adds two nullable columns to public.locations to support the
-- org-leader dashboard's annual goal pace bars and the wins / needs-
-- attention engine.
--
-- Org-level totals are NOT stored — they are computed live as
-- SUM(locations.annual_sales_goal) and SUM(locations.annual_dv_goal)
-- grouped by org_id. This keeps a single source of truth and prevents
-- drift between an org-level goal and the sum of its clubs.
--
-- Both columns are nullable. NULL means "not configured yet" — the
-- dashboard should treat NULL distinctly from zero (faint placeholder
-- pace bar, not a 0% pace bar).
-- ════════════════════════════════════════════════════════════════════

alter table public.locations
  add column if not exists annual_sales_goal numeric;

alter table public.locations
  add column if not exists annual_dv_goal integer;

-- Schema documentation for future readers.

comment on column public.locations.annual_sales_goal is
  'Per-club annual sales goal in USD (gross revenue, year-to-date target). NULL = not configured. Set by the org leader in the org-admin Settings UI. Org-level total is computed as SUM grouped by org_id; never store an org-level goal separately or it will drift.';

comment on column public.locations.annual_dv_goal is
  'Per-club annual Distributor Volume goal (whole-number volume points). NULL = not configured. Set by the org leader in the org-admin Settings UI. Org-level total is computed as SUM grouped by org_id; never store an org-level goal separately or it will drift.';

-- ════════════════════════════════════════════════════════════════════
-- Verify (optional — run after the alters above):
--   select id, name, annual_sales_goal, annual_dv_goal
--   from public.locations
--   limit 5;
-- Expected: existing rows show NULL for both new columns.
-- ════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════
-- Rollback (only if needed):
--   alter table public.locations drop column if exists annual_sales_goal;
--   alter table public.locations drop column if exists annual_dv_goal;
-- ════════════════════════════════════════════════════════════════════
