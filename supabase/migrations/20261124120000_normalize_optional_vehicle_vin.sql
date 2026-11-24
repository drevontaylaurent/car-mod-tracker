alter table public.vehicles
  alter column vin drop not null;

update public.vehicles
set vin = null
where vin is not null
  and btrim(vin) = '';

notify pgrst, 'reload schema';
