begin;

alter table public.vehicle_diagnostics
  alter column description drop not null;

alter table public.vehicle_diagnostics
  drop constraint if exists vehicle_diagnostics_code_format,
  drop constraint if exists vehicle_diagnostics_code_length,
  drop constraint if exists vehicle_diagnostics_code_normalized,
  drop constraint if exists vehicle_diagnostics_description_length,
  drop constraint if exists vehicle_diagnostics_severity;

update public.vehicle_diagnostics
set code = upper(btrim(code))
where code is distinct from upper(btrim(code));

update public.vehicle_diagnostics
set description = null
where description is not null
  and length(btrim(description)) = 0;

update public.vehicle_diagnostics
set severity = 'minor'
where severity in ('attention', 'informational');

alter table public.vehicle_diagnostics
  add constraint vehicle_diagnostics_code_length
    check (length(btrim(code)) between 1 and 32) not valid,
  add constraint vehicle_diagnostics_code_normalized
    check (code = upper(btrim(code))) not valid,
  add constraint vehicle_diagnostics_description_length
    check (description is null or length(description) <= 500) not valid,
  add constraint vehicle_diagnostics_severity
    check (severity in ('critical', 'minor')) not valid;

alter table public.vehicle_diagnostics
  validate constraint vehicle_diagnostics_code_length;
alter table public.vehicle_diagnostics
  validate constraint vehicle_diagnostics_code_normalized;
alter table public.vehicle_diagnostics
  validate constraint vehicle_diagnostics_description_length;
alter table public.vehicle_diagnostics
  validate constraint vehicle_diagnostics_severity;

notify pgrst, 'reload schema';

commit;
