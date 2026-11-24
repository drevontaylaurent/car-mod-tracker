alter table public.vehicles
  alter column vin drop not null;

notify pgrst, 'reload schema';
