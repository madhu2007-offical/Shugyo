-- 1. Profiles Table (Auto-created via trigger on auth.users signup)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

create policy "Users can view and update their own profile"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Progress Table
create table public.progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  node_id text not null,
  status text not null check (status in ('locked', 'in_progress', 'done')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_node unique (user_id, node_id)
);

-- Enable RLS
alter table public.progress enable row level security;

create policy "Users can manage their own progress"
  on public.progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- 3. Checklist Items Table
create table public.checklist_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  item_id text not null,
  completed boolean default false not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_item unique (user_id, item_id)
);

-- Enable RLS
alter table public.checklist_items enable row level security;

create policy "Users can manage their own checklist items"
  on public.checklist_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- 4. Test Attempts Table
create table public.test_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  test_id text not null,
  score integer not null,
  total_questions integer not null,
  attempted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.test_attempts enable row level security;

create policy "Users can manage their own test attempts"
  on public.test_attempts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- 5. Streaks Table
create table public.streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  activity_date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_date unique (user_id, activity_date)
);

-- Enable RLS
alter table public.streaks enable row level security;

create policy "Users can manage their own streaks"
  on public.streaks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
