-- nergy.ai shared workspace schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).

create table if not exists projects (
  id text primary key,
  name text not null,
  url text not null,
  description text not null default '',
  status text not null default 'ready',
  analyzed_at timestamptz,
  source_count int not null default 0,
  model text,
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  docs jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workspace_meta (
  id text primary key default 'default',
  active_project_id text references projects(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into workspace_meta (id, active_project_id)
values ('default', null)
on conflict (id) do nothing;

-- Deny all access via anon/authenticated roles. Only service_role (server) can read/write.
alter table projects enable row level security;
alter table workspace_meta enable row level security;

drop policy if exists "deny_all_projects" on projects;
create policy "deny_all_projects" on projects for all using (false) with check (false);

drop policy if exists "deny_all_workspace_meta" on workspace_meta;
create policy "deny_all_workspace_meta" on workspace_meta for all using (false) with check (false);
