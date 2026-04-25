-- ════════════════════════════════════════════════════════════════════
-- MyClubTracker — Product Change Requests + Audit Log
-- Run this once in Supabase SQL Editor.
-- Safe to re-run (uses IF NOT EXISTS / replace where possible).
-- ════════════════════════════════════════════════════════════════════

-- ── product_change_requests: clubs propose updates to the master catalog ──
create table if not exists public.product_change_requests (
  id               uuid primary key default gen_random_uuid(),
  location_id      uuid references public.locations(id) on delete cascade,
  proposer_user_id uuid references public.users(id) on delete set null,
  proposer_name    text,
  change_type      text not null check (change_type in ('add','edit','remove')),
  before_data      jsonb,                  -- existing product (edit/remove); null for add
  after_data       jsonb,                  -- proposed product (add/edit); null for remove
  status           text not null default 'pending' check (status in ('pending','approved','denied')),
  admin_notes      text,
  created_at       timestamptz not null default now(),
  resolved_at      timestamptz,
  resolved_by      uuid references public.users(id) on delete set null
);

create index if not exists idx_pcr_status   on public.product_change_requests(status);
create index if not exists idx_pcr_location on public.product_change_requests(location_id);
create index if not exists idx_pcr_created  on public.product_change_requests(created_at desc);

alter table public.product_change_requests enable row level security;

drop policy if exists "Authenticated full access on product_change_requests" on public.product_change_requests;
create policy "Authenticated full access on product_change_requests"
  on public.product_change_requests for all
  to authenticated
  using (true)
  with check (true);


-- ── product_audit_log: history of master-list changes + push-to-clubs events ──
create table if not exists public.product_audit_log (
  id                 uuid primary key default gen_random_uuid(),
  actor_user_id      uuid references public.users(id) on delete set null,
  actor_name         text,
  action             text not null,        -- 'add'|'edit'|'remove'|'push_to_clubs'|'approve_proposal'|'deny_proposal'
  product_name       text,
  product_category   text,
  before_data        jsonb,
  after_data         jsonb,
  target_location_id uuid references public.locations(id) on delete set null,
  notes              text,
  created_at         timestamptz not null default now()
);

create index if not exists idx_pal_created on public.product_audit_log(created_at desc);
create index if not exists idx_pal_action  on public.product_audit_log(action);

alter table public.product_audit_log enable row level security;

drop policy if exists "Authenticated full access on product_audit_log" on public.product_audit_log;
create policy "Authenticated full access on product_audit_log"
  on public.product_audit_log for all
  to authenticated
  using (true)
  with check (true);

-- ════════════════════════════════════════════════════════════════════
-- Done. You should see 2 new tables in the Table Editor:
--   public.product_change_requests
--   public.product_audit_log
-- ════════════════════════════════════════════════════════════════════
