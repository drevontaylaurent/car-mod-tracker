create table if not exists public.vehicle_diagnostics (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  code text not null,
  description text,
  status text not null default 'active',
  severity text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint vehicle_diagnostics_code_length
    check (length(btrim(code)) between 1 and 32),
  constraint vehicle_diagnostics_code_normalized
    check (code = upper(btrim(code))),
  constraint vehicle_diagnostics_description_length
    check (
      description is null
      or length(btrim(description)) between 1 and 500
    ),
  constraint vehicle_diagnostics_status
    check (status in ('active', 'pending', 'resolved')),
  constraint vehicle_diagnostics_severity
    check (severity in ('critical', 'minor')),
  constraint vehicle_diagnostics_notes_length
    check (notes is null or length(notes) <= 2000),
  constraint vehicle_diagnostics_resolution_timestamp
    check (
      (status = 'resolved' and resolved_at is not null)
      or (status <> 'resolved' and resolved_at is null)
    )
);

create index if not exists vehicle_diagnostics_vehicle_created_idx
  on public.vehicle_diagnostics (vehicle_id, created_at desc);

create index if not exists vehicle_diagnostics_user_vehicle_idx
  on public.vehicle_diagnostics (user_id, vehicle_id);

create index if not exists vehicle_diagnostics_vehicle_status_idx
  on public.vehicle_diagnostics (vehicle_id, status, severity);

alter table public.vehicle_diagnostics enable row level security;

revoke all on public.vehicle_diagnostics from anon, public;
grant select, insert, update, delete
  on public.vehicle_diagnostics to authenticated;

drop policy if exists "Owners can view vehicle diagnostics"
  on public.vehicle_diagnostics;
create policy "Owners can view vehicle diagnostics"
  on public.vehicle_diagnostics
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id = vehicle_diagnostics.vehicle_id
        and vehicle.user_id = (select auth.uid())
    )
  );

drop policy if exists "Owners can add vehicle diagnostics"
  on public.vehicle_diagnostics;
create policy "Owners can add vehicle diagnostics"
  on public.vehicle_diagnostics
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id = vehicle_diagnostics.vehicle_id
        and vehicle.user_id = (select auth.uid())
    )
  );

drop policy if exists "Owners can update vehicle diagnostics"
  on public.vehicle_diagnostics;
create policy "Owners can update vehicle diagnostics"
  on public.vehicle_diagnostics
  for update
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id = vehicle_diagnostics.vehicle_id
        and vehicle.user_id = (select auth.uid())
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id = vehicle_diagnostics.vehicle_id
        and vehicle.user_id = (select auth.uid())
    )
  );

drop policy if exists "Owners can delete vehicle diagnostics"
  on public.vehicle_diagnostics;
create policy "Owners can delete vehicle diagnostics"
  on public.vehicle_diagnostics
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id = vehicle_diagnostics.vehicle_id
        and vehicle.user_id = (select auth.uid())
    )
  );

notify pgrst, 'reload schema';
