alter table public.mods
  drop constraint if exists mods_category_valid;

alter table public.mods
  add constraint mods_category_valid check (
    category in (
      'Engine',
      'Suspension',
      'Exhaust',
      'Exterior',
      'Interior',
      'Wheels/Tires',
      'Electronics',
      'Power Mods',
      'Maintenance Parts'
    )
  );
