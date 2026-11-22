do $migration$
begin
  if exists (
    select 1
    from public.vehicles
    group by user_id, vin
    having count(*) > 1
  ) then
    raise exception
      'Cannot add vehicles_user_id_vin_key: duplicate VINs exist for at least one user. Resolve duplicates manually, then rerun this migration.';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.vehicles'::regclass
      and conname = 'vehicles_user_id_vin_key'
      and contype = 'u'
  ) then
    alter table public.vehicles
      add constraint vehicles_user_id_vin_key unique (user_id, vin);
  end if;
end
$migration$;

notify pgrst, 'reload schema';
