create table if not exists public.mods (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  part_name text not null,
  brand text,
  category text not null,
  status text not null default 'Wishlist',
  cost numeric(12, 2) not null default 0,
  install_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mods_part_name_nonempty check (length(btrim(part_name)) > 0),
  constraint mods_category_valid check (
    category in (
      'Engine',
      'Suspension',
      'Exhaust',
      'Exterior',
      'Interior',
      'Wheels/Tires',
      'Electronics'
    )
  ),
  constraint mods_status_valid check (status in ('Wishlist', 'Ordered', 'Installed')),
  constraint mods_cost_nonnegative check (cost >= 0)
);

create index if not exists mods_vehicle_created_at_idx
  on public.mods (vehicle_id, created_at desc);

create index if not exists mods_user_vehicle_idx
  on public.mods (user_id, vehicle_id);

create index if not exists mods_vehicle_category_idx
  on public.mods (vehicle_id, category);

create index if not exists mods_vehicle_status_idx
  on public.mods (vehicle_id, status);

alter table public.mods enable row level security;

grant select, insert, update, delete on table public.mods to authenticated;

drop policy if exists "Users can view mods for their vehicles" on public.mods;
create policy "Users can view mods for their vehicles"
  on public.mods
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles as vehicles
      where vehicles.id = mods.vehicle_id
        and vehicles.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can add mods to their vehicles" on public.mods;
create policy "Users can add mods to their vehicles"
  on public.mods
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles as vehicles
      where vehicles.id = mods.vehicle_id
        and vehicles.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can update mods for their vehicles" on public.mods;
create policy "Users can update mods for their vehicles"
  on public.mods
  for update
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles as vehicles
      where vehicles.id = mods.vehicle_id
        and vehicles.user_id = (select auth.uid())
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles as vehicles
      where vehicles.id = mods.vehicle_id
        and vehicles.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can delete mods for their vehicles" on public.mods;
create policy "Users can delete mods for their vehicles"
  on public.mods
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles as vehicles
      where vehicles.id = mods.vehicle_id
        and vehicles.user_id = (select auth.uid())
    )
  );

notify pgrst, 'reload schema';
