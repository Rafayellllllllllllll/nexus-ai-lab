-- 合并版后端：在 StudyFlow 已有项目里加 Nexus 表（不改动 StudyFlow 原有 subjects/mistakes 等表）。
-- 先跑 001_nexus.sql，再跑本文件。全部 IF NOT EXISTS / 策略幂等，可重跑。
create table if not exists nexus_study_subjects (id text primary key, data jsonb not null, updated_at timestamptz default now());
create table if not exists nexus_study_mistakes (id text primary key, data jsonb not null, updated_at timestamptz default now());
create table if not exists nexus_study_reviews (id text primary key, data jsonb not null, updated_at timestamptz default now());
create table if not exists nexus_study_sessions (id text primary key, data jsonb not null, updated_at timestamptz default now());
create table if not exists nexus_study_tasks (id text primary key, data jsonb not null, updated_at timestamptz default now());
alter table nexus_study_subjects enable row level security;
alter table nexus_study_mistakes enable row level security;
alter table nexus_study_reviews enable row level security;
alter table nexus_study_sessions enable row level security;
alter table nexus_study_tasks enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='nexus_study_subjects' and policyname='nexus_anon_all') then
    create policy nexus_anon_all on nexus_study_subjects for all to anon using (true) with check (true);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='nexus_study_mistakes' and policyname='nexus_anon_all') then
    create policy nexus_anon_all on nexus_study_mistakes for all to anon using (true) with check (true);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='nexus_study_reviews' and policyname='nexus_anon_all') then
    create policy nexus_anon_all on nexus_study_reviews for all to anon using (true) with check (true);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='nexus_study_sessions' and policyname='nexus_anon_all') then
    create policy nexus_anon_all on nexus_study_sessions for all to anon using (true) with check (true);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='nexus_study_tasks' and policyname='nexus_anon_all') then
    create policy nexus_anon_all on nexus_study_tasks for all to anon using (true) with check (true);
  end if;
end $$;
