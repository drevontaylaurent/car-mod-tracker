create table if not exists public.build_phases (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  position integer not null,
  status text not null default 'planned',
  target_completion_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint build_phases_id_vehicle_user_unique
    unique (id, vehicle_id, user_id),
  constraint build_phases_vehicle_position_unique
    unique (vehicle_id, position),
  constraint build_phases_name_nonempty
    check (length(btrim(name)) between 1 and 100),
  constraint build_phases_description_length
    check (description is null or length(description) <= 1500),
  constraint build_phases_position_nonnegative
    check (position >= 0),
  constraint build_phases_status
    check (status in ('planned', 'in_progress', 'completed')),
  constraint build_phases_completion_timestamp
    check (
      (status = 'completed' and completed_at is not null)
      or (status <> 'completed' and completed_at is null)
    )
);

create index if not exists build_phases_user_vehicle_idx
  on public.build_phases (user_id, vehicle_id);

alter table public.mods
  add column if not exists phase_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'mods_build_phase_ownership_fk'
      and conrelid = 'public.mods'::regclass
  ) then
    alter table public.mods
      add constraint mods_build_phase_ownership_fk
      foreign key (phase_id, vehicle_id, user_id)
      references public.build_phases (id, vehicle_id, user_id)
      on delete set null (phase_id);
  end if;
end;
$$;

create index if not exists mods_phase_vehicle_user_idx
  on public.mods (phase_id, vehicle_id, user_id);

alter table public.build_phases enable row level security;

revoke all on public.build_phases from anon, public;
grant select, insert, update, delete
  on public.build_phases to authenticated;

drop policy if exists "Owners can view build phases"
  on public.build_phases;
create policy "Owners can view build phases"
  on public.build_phases
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id = build_phases.vehicle_id
        and vehicle.user_id = (select auth.uid())
    )
  );

drop policy if exists "Owners can add build phases"
  on public.build_phases;
create policy "Owners can add build phases"
  on public.build_phases
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id = build_phases.vehicle_id
        and vehicle.user_id = (select auth.uid())
    )
  );

drop policy if exists "Owners can update build phases"
  on public.build_phases;
create policy "Owners can update build phases"
  on public.build_phases
  for update
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id = build_phases.vehicle_id
        and vehicle.user_id = (select auth.uid())
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id = build_phases.vehicle_id
        and vehicle.user_id = (select auth.uid())
    )
  );

drop policy if exists "Owners can delete build phases"
  on public.build_phases;
create policy "Owners can delete build phases"
  on public.build_phases
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id = build_phases.vehicle_id
        and vehicle.user_id = (select auth.uid())
    )
  );

notify pgrst, 'reload schema';
