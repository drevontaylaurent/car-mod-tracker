create table if not exists public.build_shares (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null unique references public.vehicles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  share_token uuid not null unique default gen_random_uuid(),
  is_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint build_shares_vehicle_owner
    check (user_id is not null and share_token is not null)
);

create index if not exists build_shares_owner_idx
  on public.build_shares (user_id);

alter table public.build_shares enable row level security;

grant select, insert, update, delete on table public.build_shares to authenticated;

drop policy if exists "Owners can view their build shares" on public.build_shares;
create policy "Owners can view their build shares"
  on public.build_shares
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Owners can create their build shares" on public.build_shares;
create policy "Owners can create their build shares"
  on public.build_shares
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id = vehicle_id
        and vehicle.user_id = (select auth.uid())
    )
  );

drop policy if exists "Owners can update their build shares" on public.build_shares;
create policy "Owners can update their build shares"
  on public.build_shares
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id = vehicle_id
        and vehicle.user_id = (select auth.uid())
    )
  );

drop policy if exists "Owners can delete their build shares" on public.build_shares;
create policy "Owners can delete their build shares"
  on public.build_shares
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.get_shared_build(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
  select case
    when vehicle.id is null then null
    else jsonb_build_object(
      'nickname', vehicle.nickname,
      'year', vehicle.year,
      'make', vehicle.make,
      'model', vehicle.model,
      'trim', vehicle.trim,
      'totalModCount', coalesce(mods.total_mod_count, 0),
      'installedCount', coalesce(mods.installed_count, 0),
      'progress',
        case
          when coalesce(mods.total_mod_count, 0) = 0 then 0
          else round((mods.installed_count::numeric / mods.total_mod_count) * 100)::integer
        end,
      'modifications', coalesce(mods.items, '[]'::jsonb)
    )
  end
  from public.build_shares as share
  join public.vehicles as vehicle
    on vehicle.id = share.vehicle_id
  left join lateral (
    select
      count(*)::integer as total_mod_count,
      count(*) filter (where mod.status = 'Installed')::integer as installed_count,
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'name', mod.part_name,
            'category', mod.category,
            'status', mod.status
          )
          order by mod.created_at desc
        ) filter (where mod.id is not null),
        '[]'::jsonb
      ) as items
    from public.mods as mod
    where mod.vehicle_id = vehicle.id
  ) as mods on true
  where share.share_token = p_token
    and share.is_enabled = true;
$function$;

revoke all on function public.get_shared_build(uuid) from public;
grant execute on function public.get_shared_build(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
