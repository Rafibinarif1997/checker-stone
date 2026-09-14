-- Run in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 x_username text unique,
 evm_address text,
 solana_address text,
 sui_address text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.projects(
 id uuid primary key default gen_random_uuid(),
 name text not null,
 slug text unique not null,
 description text,
 logo_url text,
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 gtd_slots integer not null default 0 check(gtd_slots>=0),
 status text not null default 'draft' check(status in('draft','scheduled','live','ended')),
 created_at timestamptz not null default now()
);

create table if not exists public.mission_tasks(
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.projects(id) on delete cascade,
 title text not null,
 task_type text not null check(task_type in('x_follow','x_like','x_repost','website','discord','custom')),
 target_value text,
 required boolean not null default true,
 sort_order integer not null default 0
);

create table if not exists public.task_verifications(
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.projects(id) on delete cascade,
 task_id uuid not null references public.mission_tasks(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 status text not null check(status in('verified','failed','pending')),
 checked_at timestamptz not null default now(),
 source text not null default 'x_api',
 unique(project_id,task_id,user_id)
);

create table if not exists public.mission_submissions(
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.projects(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 status text not null default 'pending' check(status in('pending','verified','rejected')),
 submitted_at timestamptz not null default now(),
 verified_at timestamptz,
 unique(project_id,user_id)
);

create table if not exists public.gtd_winners(
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.projects(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 selected_at timestamptz not null default now(),
 unique(project_id,user_id)
);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.mission_tasks enable row level security;
alter table public.task_verifications enable row level security;
alter table public.mission_submissions enable row level security;
alter table public.gtd_winners enable row level security;

create policy "own profile select" on public.profiles for select to authenticated using(auth.uid()=id);
create policy "own profile insert" on public.profiles for insert to authenticated with check(auth.uid()=id);
create policy "own profile update" on public.profiles for update to authenticated using(auth.uid()=id) with check(auth.uid()=id);
create policy "public project read" on public.projects for select using(status in('scheduled','live','ended'));
create policy "public task read" on public.mission_tasks for select using(exists(select 1 from public.projects p where p.id=project_id and p.status in('scheduled','live','ended')));
create policy "own verification read" on public.task_verifications for select to authenticated using(auth.uid()=user_id);
create policy "own submission read" on public.mission_submissions for select to authenticated using(auth.uid()=user_id);
create policy "own submission insert" on public.mission_submissions for insert to authenticated with check(auth.uid()=user_id);
create policy "ended winners read" on public.gtd_winners for select using(exists(select 1 from public.projects p where p.id=project_id and p.status='ended'));
