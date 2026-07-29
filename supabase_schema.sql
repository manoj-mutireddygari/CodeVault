-- ============================================================
--  CodeVault — Supabase SQL Schema
--  Run this entire file in:
--    Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ────────────────────────────────────────────────────────────
-- 1. PROFILES
--    One row per authenticated user. Auto-created on signup.
-- ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid        primary key references auth.users(id) on delete cascade,
  email           text        not null,
  full_name       text        not null default '',
  username        text        unique,
  avatar_url      text,
  github_username text,
  plan            text        not null default 'free'
                              check (plan in ('free', 'pro', 'developer')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- shared updated_at trigger function
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    split_part(new.email, '@', 1)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ────────────────────────────────────────────────────────────
-- 2. REPOSITORIES
--    The GitHub repo each user has linked. One per user.
-- ────────────────────────────────────────────────────────────
create table if not exists public.repositories (
  id                    uuid        primary key default uuid_generate_v4(),
  user_id               uuid        not null references public.profiles(id) on delete cascade,
  repository_name       text        not null,
  repository_owner      text,
  visibility            text        not null default 'public'
                                    check (visibility in ('public', 'private')),
  default_branch        text        not null default 'main',
  github_repository_id  bigint,
  github_token          text,
  last_sync             timestamptz,
  created_at            timestamptz not null default now(),
  unique (user_id)
);


-- ────────────────────────────────────────────────────────────
-- 3. SETTINGS
--    Per-user dashboard preferences.
-- ────────────────────────────────────────────────────────────
create table if not exists public.settings (
  user_id          uuid        primary key references public.profiles(id) on delete cascade,
  theme            text        not null default 'system'
                               check (theme in ('light', 'dark', 'system')),
  animations       boolean     not null default true,
  compact_mode     boolean     not null default false,
  notifications    boolean     not null default true,
  default_page     text        not null default '/dashboard',
  refresh_interval integer     not null default 5
                               check (refresh_interval in (1, 5, 15, 30)),
  updated_at       timestamptz not null default now()
);

drop trigger if exists settings_updated_at on public.settings;
create trigger settings_updated_at
  before update on public.settings
  for each row execute procedure public.set_updated_at();

-- Auto-create default settings when profile is created
create or replace function public.handle_new_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();


-- ────────────────────────────────────────────────────────────
-- 4. SUBMISSIONS
--    Every LeetCode solution the extension has uploaded.
-- ────────────────────────────────────────────────────────────
create table if not exists public.submissions (
  id            uuid        primary key default uuid_generate_v4(),
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  problem_id    integer     not null,
  title         text        not null,
  slug          text        not null,
  difficulty    text        not null default 'Unknown'
                            check (difficulty in ('Easy', 'Medium', 'Hard', 'Unknown')),
  topics        text[]      not null default '{}',
  language      text        not null,
  source_code   text,
  test_cases    text,
  runtime       text,
  memory        text,
  submitted_at  timestamptz not null,
  github_url    text,
  folder_name   text,
  created_at    timestamptz not null default now(),
  unique (user_id, problem_id, language)
);

-- Migration for existing installations:
alter table public.submissions add column if not exists test_cases text;

create index if not exists submissions_user_id_idx      on public.submissions (user_id);
create index if not exists submissions_submitted_at_idx on public.submissions (user_id, submitted_at desc);
create index if not exists submissions_difficulty_idx   on public.submissions (user_id, difficulty);
create index if not exists submissions_language_idx     on public.submissions (user_id, language);


-- ────────────────────────────────────────────────────────────
-- 5. SYNC QUEUE
--    Offline queue for submissions waiting to be pushed.
-- ────────────────────────────────────────────────────────────
create table if not exists public.sync_queue (
  id            uuid        primary key default uuid_generate_v4(),
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  problem_id    integer     not null,
  title         text        not null,
  slug          text        not null,
  difficulty    text        not null default 'Unknown',
  topics        text[]      not null default '{}',
  language      text        not null,
  source_code   text        not null,
  test_cases    text,
  runtime       text,
  memory        text,
  submitted_at  timestamptz not null,
  leetcode_url  text,
  status        text        not null default 'pending'
                            check (status in ('pending', 'syncing', 'done', 'failed')),
  attempts      integer     not null default 0,
  error_message text,
  created_at    timestamptz not null default now(),
  synced_at     timestamptz,
  unique (user_id, problem_id, language)
);

alter table public.sync_queue add column if not exists test_cases text;

create index if not exists sync_queue_user_status_idx on public.sync_queue (user_id, status);


-- ────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS)
--    Each user can only access their own rows.
-- ────────────────────────────────────────────────────────────

-- profiles
alter table public.profiles enable row level security;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- repositories
alter table public.repositories enable row level security;
drop policy if exists "repos_select" on public.repositories;
drop policy if exists "repos_insert" on public.repositories;
drop policy if exists "repos_update" on public.repositories;
drop policy if exists "repos_delete" on public.repositories;
create policy "repos_select" on public.repositories for select using (auth.uid() = user_id);
create policy "repos_insert" on public.repositories for insert with check (auth.uid() = user_id);
create policy "repos_update" on public.repositories for update using (auth.uid() = user_id);
create policy "repos_delete" on public.repositories for delete using (auth.uid() = user_id);

-- settings
alter table public.settings enable row level security;
drop policy if exists "settings_select" on public.settings;
drop policy if exists "settings_update" on public.settings;
create policy "settings_select" on public.settings for select using (auth.uid() = user_id);
create policy "settings_update" on public.settings for update using (auth.uid() = user_id);

-- submissions
alter table public.submissions enable row level security;
drop policy if exists "submissions_select" on public.submissions;
drop policy if exists "submissions_insert" on public.submissions;
drop policy if exists "submissions_delete" on public.submissions;
create policy "submissions_select" on public.submissions for select using (auth.uid() = user_id);
create policy "submissions_insert" on public.submissions for insert with check (auth.uid() = user_id);
create policy "submissions_delete" on public.submissions for delete using (auth.uid() = user_id);

-- sync_queue
alter table public.sync_queue enable row level security;
drop policy if exists "sync_queue_select" on public.sync_queue;
drop policy if exists "sync_queue_insert" on public.sync_queue;
drop policy if exists "sync_queue_update" on public.sync_queue;
drop policy if exists "sync_queue_delete" on public.sync_queue;
create policy "sync_queue_select" on public.sync_queue for select using (auth.uid() = user_id);
create policy "sync_queue_insert" on public.sync_queue for insert with check (auth.uid() = user_id);
create policy "sync_queue_update" on public.sync_queue for update using (auth.uid() = user_id);
create policy "sync_queue_delete" on public.sync_queue for delete using (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 7. SYNC LOGS
--    Audit log of synchronization activities, successes, and errors.
-- ────────────────────────────────────────────────────────────
create table if not exists public.sync_logs (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  category    text        not null default 'system'
                          check (category in ('sync', 'error', 'system')),
  title       text        not null,
  message     text        not null,
  created_at  timestamptz not null default now()
);

create index if not exists sync_logs_user_idx on public.sync_logs (user_id, created_at desc);

-- RLS for sync_logs
alter table public.sync_logs enable row level security;
drop policy if exists "sync_logs_select" on public.sync_logs;
drop policy if exists "sync_logs_insert" on public.sync_logs;
drop policy if exists "sync_logs_delete" on public.sync_logs;
create policy "sync_logs_select" on public.sync_logs for select using (auth.uid() = user_id);
create policy "sync_logs_insert" on public.sync_logs for insert with check (auth.uid() = user_id);
create policy "sync_logs_delete" on public.sync_logs for delete using (auth.uid() = user_id);


-- ============================================================
-- Done. All tables, triggers, indexes and RLS policies created.
-- ============================================================

