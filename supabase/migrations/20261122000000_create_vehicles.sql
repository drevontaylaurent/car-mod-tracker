create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vin text not null,
  year integer,
  make text,
  model text,
  trim text,
  nickname text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehicles_vin_format check (vin ~ '^[A-HJ-NPR-Z0-9]{17}$'),
  constraint vehicles_year_range check (year is null or year between 1886 and 2200)
);

create index if not exists vehicles_user_id_created_at_idx
  on public.vehicles (user_id, created_at desc);

alter table public.vehicles enable row level security;

grant select, insert, update, delete on table public.vehicles to authenticated;

drop policy if exists "Users can view their own vehicles" on public.vehicles;
create policy "Users can view their own vehicles"
  on public.vehicles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add their own vehicles" on public.vehicles;
create policy "Users can add their own vehicles"
  on public.vehicles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own vehicles" on public.vehicles;
create policy "Users can update their own vehicles"
  on public.vehicles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own vehicles" on public.vehicles;
create policy "Users can delete their own vehicles"
  on public.vehicles
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

notify pgrst, 'reload schema';
