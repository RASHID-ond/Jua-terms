-- ============================================================================
-- Jua Terms — Supabase schema, security policies, and storage setup
-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor
-- → New query → paste this whole file → Run).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE everywhere.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLES
-- ----------------------------------------------------------------------------

-- Site content, stored as key/value rows (mirrors the old db.json structure).
-- Keys used by the app: siteSettings, about, visionMission, focusAreas,
-- approach, events, highlights, team, partners, footer.
create table if not exists content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Admin users. id must match the corresponding auth.users id (Supabase Auth
-- handles passwords/sessions; this table just holds role + profile info).
create table if not exists admins (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('Super Admin', 'Editor')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Contact form submissions.
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Admin activity log.
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS (security definer so they can check the admins table
--    without getting blocked by the admins table's own RLS policies — this
--    is the standard Supabase pattern for role checks, and avoids infinite
--    recursion in the admins table's SELECT policy below).
-- ----------------------------------------------------------------------------

create or replace function is_admin(uid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from admins where id = uid and active = true
  );
$$;

create or replace function is_super_admin(uid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from admins where id = uid and role = 'Super Admin' and active = true
  );
$$;

-- ----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY — every table defaults to "no access" until a policy
--    explicitly allows it. This is the actual security boundary for the site.
-- ----------------------------------------------------------------------------

alter table content enable row level security;
alter table admins enable row level security;
alter table messages enable row level security;
alter table audit_logs enable row level security;

-- CONTENT: anyone can read (it's the public website); only admins can write.
drop policy if exists "content_public_read" on content;
create policy "content_public_read"
  on content for select
  using (true);

drop policy if exists "content_admin_write" on content;
create policy "content_admin_write"
  on content for all
  using (is_admin(auth.uid()))
  with check (is_admin(auth.uid()));

-- ADMINS: an admin can see their own row, or a Super Admin can see everyone.
-- Inserting is allowed either as a one-time bootstrap (when the table is
-- still empty, i.e. no admin exists yet) or by an existing Super Admin.
-- Updating/deleting other admins requires Super Admin.
drop policy if exists "admins_self_or_super_read" on admins;
create policy "admins_self_or_super_read"
  on admins for select
  using (auth.uid() = id or is_super_admin(auth.uid()));

drop policy if exists "admins_bootstrap_or_super_insert" on admins;
create policy "admins_bootstrap_or_super_insert"
  on admins for insert
  with check (
    (select count(*) from admins) = 0 or is_super_admin(auth.uid())
  );

drop policy if exists "admins_super_update" on admins;
create policy "admins_super_update"
  on admins for update
  using (is_super_admin(auth.uid()))
  with check (is_super_admin(auth.uid()));

drop policy if exists "admins_super_delete" on admins;
create policy "admins_super_delete"
  on admins for delete
  using (is_super_admin(auth.uid()));

-- MESSAGES: anyone can submit the contact form (insert only — they cannot
-- read other people's messages). Only admins can read/manage messages.
drop policy if exists "messages_public_insert" on messages;
create policy "messages_public_insert"
  on messages for insert
  with check (true);

drop policy if exists "messages_admin_read" on messages;
create policy "messages_admin_read"
  on messages for select
  using (is_admin(auth.uid()));

drop policy if exists "messages_admin_update" on messages;
create policy "messages_admin_update"
  on messages for update
  using (is_admin(auth.uid()));

drop policy if exists "messages_admin_delete" on messages;
create policy "messages_admin_delete"
  on messages for delete
  using (is_admin(auth.uid()));

-- AUDIT LOGS: only admins can write or read.
drop policy if exists "audit_admin_insert" on audit_logs;
create policy "audit_admin_insert"
  on audit_logs for insert
  with check (is_admin(auth.uid()));

drop policy if exists "audit_admin_read" on audit_logs;
create policy "audit_admin_read"
  on audit_logs for select
  using (is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 4. STORAGE — a public bucket for the logo and other uploaded images.
--    Public read (so images actually display on the live site), admin-only
--    write.
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "site_assets_public_read" on storage.objects;
create policy "site_assets_public_read"
  on storage.objects for select
  using (bucket_id = 'site-assets');

drop policy if exists "site_assets_admin_write" on storage.objects;
create policy "site_assets_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'site-assets' and is_admin(auth.uid()));

drop policy if exists "site_assets_admin_update" on storage.objects;
create policy "site_assets_admin_update"
  on storage.objects for update
  using (bucket_id = 'site-assets' and is_admin(auth.uid()));

drop policy if exists "site_assets_admin_delete" on storage.objects;
create policy "site_assets_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'site-assets' and is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 5. SEED DEFAULT CONTENT — only inserts if the row doesn't already exist,
--    so re-running this file is safe and won't overwrite live edits.
-- ----------------------------------------------------------------------------

insert into content (key, value) values
  ('siteSettings', '{
    "address": "Nairobi, Kenya",
    "phone": "+254-740-834265",
    "email": "juaterms@gmail.com",
    "social": "@juaterms",
    "heroTitle": "JUA TERMS PROFILE",
    "heroSubtitle": "Simplify. Clarify. Champion Informed Consent.",
    "seoTitle": "Jua Terms - Digital Rights Advocacy Campaign",
    "seoDescription": "Advocating for simpler, clearer terms and conditions to enable meaningful informed consent."
  }'::jsonb)
on conflict (key) do nothing;

-- NOTE: the remaining content sections (about, visionMission, focusAreas,
-- approach, events, highlights, team, partners, footer) are longer and are
-- best migrated from your existing src/data/db.json (if you have one) using
-- the migration script described in the setup guide, so none of your current
-- content is lost. If you're starting fresh, the app's built-in
-- src/data/campaignData.ts fallbacks will display until you fill these in
-- from the admin dashboard.
