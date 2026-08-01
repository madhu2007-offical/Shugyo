-- 1. Enable UUID generation extension
create extension if not exists "uuid-ossp";

-- 2. The consolidated user progress table (Single Source of Truth)
create table public.user_progress (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  phase_state     jsonb not null default '{}'::jsonb,
  checklist_state jsonb not null default '[]'::jsonb,
  grade_state     jsonb not null default '{}'::jsonb,
  streak_days     jsonb not null default '[]'::jsonb,
  sql_solved      jsonb not null default '[]'::jsonb,
  exam_count      integer not null default 0,
  badges_earned   jsonb not null default '[]'::jsonb,
  updated_at      timestamptz not null default now(),
  unique(user_id)
);

-- 3. Auto-update the updated_at timestamp on every write
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_user_progress_updated
before update on public.user_progress
for each row execute function public.set_updated_at();

-- 4. Auto-create a progress row the instant someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_progress (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 5. Row Level Security (RLS) Policies
alter table public.user_progress enable row level security;

-- Users can only ever see their own row
create policy "select_own_progress"
on public.user_progress for select
using (auth.uid() = user_id);

-- Users can only ever update their own row
create policy "update_own_progress"
on public.user_progress for update
using (auth.uid() = user_id);

-- Users can only insert a row tied to themselves
create policy "insert_own_progress"
on public.user_progress for insert
with check (auth.uid() = user_id);
