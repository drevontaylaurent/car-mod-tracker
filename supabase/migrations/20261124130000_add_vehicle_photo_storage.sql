alter table public.vehicles
  add column if not exists photo_path text;

do $migration$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.vehicles'::regclass
      and conname = 'vehicles_photo_path_matches_owner'
      and contype = 'c'
  ) then
    alter table public.vehicles
      add constraint vehicles_photo_path_matches_owner
      check (
        photo_path is null
        or (
          photo_path = user_id::text || '/' || id::text || '/' ||
            split_part(photo_path, '/', 3)
          and split_part(photo_path, '/', 3) <> ''
          and array_length(string_to_array(photo_path, '/'), 1) = 3
        )
      );
  end if;
end
$migration$;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'vehicle-photos',
  'vehicle-photos',
  false,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Owners can read vehicle photos" on storage.objects;
create policy "Owners can read vehicle photos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id::text = (storage.foldername(name))[2]
        and vehicle.user_id = (select auth.uid())
    )
  );

drop policy if exists "Owners can upload vehicle photos" on storage.objects;
create policy "Owners can upload vehicle photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id::text = (storage.foldername(name))[2]
        and vehicle.user_id = (select auth.uid())
    )
  );

drop policy if exists "Owners can replace vehicle photos" on storage.objects;
create policy "Owners can replace vehicle photos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id::text = (storage.foldername(name))[2]
        and vehicle.user_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id::text = (storage.foldername(name))[2]
        and vehicle.user_id = (select auth.uid())
    )
  );

drop policy if exists "Owners can delete vehicle photos" on storage.objects;
create policy "Owners can delete vehicle photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and exists (
      select 1
      from public.vehicles as vehicle
      where vehicle.id::text = (storage.foldername(name))[2]
        and vehicle.user_id = (select auth.uid())
    )
  );

notify pgrst, 'reload schema';
