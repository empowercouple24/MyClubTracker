-- ════════════════════════════════════════════════════════════════════
-- MyClubTracker — Soft-delete users
-- Run this once in Supabase SQL Editor.
-- Safe to re-run.
-- ════════════════════════════════════════════════════════════════════

-- Add deleted_at timestamp column (NULL = active, non-NULL = soft-deleted)
alter table public.users
  add column if not exists deleted_at timestamptz;

-- Partial index for the common "active users" query pattern
create index if not exists idx_users_active
  on public.users (id)
  where deleted_at is null;

-- Helpful comment for future developers reading the schema
comment on column public.users.deleted_at is
  'Soft-delete marker. When non-null, this user is hidden from app queries but their row is preserved for audit/historical references (sales, payouts, audit_log).';

-- ════════════════════════════════════════════════════════════════════
-- Rollback (only if needed):
--   drop index if exists public.idx_users_active;
--   alter table public.users drop column if exists deleted_at;
-- ════════════════════════════════════════════════════════════════════
