-- NEXUS AI LAB · Supabase 建表脚本（在 SQL 编辑器里按顺序跑一次即可）
-- 说明：本实验室目前不做登录，表对 anon 开放读写，仅适合个人演示/实验室用途。
-- 如需多人使用，请先接 Supabase Auth，再把 policy 改成 auth.uid() = owner_id。
create table if not exists nexus_agents (id text primary key, data jsonb not null, updated_at timestamptz default now());
create table if not exists nexus_workflows (id text primary key, data jsonb not null, updated_at timestamptz default now());
create table if not exists nexus_prompts (id text primary key, data jsonb not null, updated_at timestamptz default now());
create table if not exists nexus_collections (id text primary key, data jsonb not null, updated_at timestamptz default now());
create table if not exists nexus_models (id text primary key, data jsonb not null, updated_at timestamptz default now());
create table if not exists nexus_runs (id text primary key, data jsonb not null, updated_at timestamptz default now());
create table if not exists nexus_versions (id text primary key, data jsonb not null, updated_at timestamptz default now());
alter table nexus_agents enable row level security;
alter table nexus_workflows enable row level security;
alter table nexus_prompts enable row level security;
alter table nexus_collections enable row level security;
alter table nexus_models enable row level security;
alter table nexus_runs enable row level security;
alter table nexus_versions enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='nexus_agents' and policyname='nexus_anon_all') then
    create policy nexus_anon_all on nexus_agents for all to anon using (true) with check (true);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='nexus_workflows' and policyname='nexus_anon_all') then
    create policy nexus_anon_all on nexus_workflows for all to anon using (true) with check (true);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='nexus_prompts' and policyname='nexus_anon_all') then
    create policy nexus_anon_all on nexus_prompts for all to anon using (true) with check (true);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='nexus_collections' and policyname='nexus_anon_all') then
    create policy nexus_anon_all on nexus_collections for all to anon using (true) with check (true);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='nexus_models' and policyname='nexus_anon_all') then
    create policy nexus_anon_all on nexus_models for all to anon using (true) with check (true);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='nexus_runs' and policyname='nexus_anon_all') then
    create policy nexus_anon_all on nexus_runs for all to anon using (true) with check (true);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='nexus_versions' and policyname='nexus_anon_all') then
    create policy nexus_anon_all on nexus_versions for all to anon using (true) with check (true);
  end if;
end $$;
