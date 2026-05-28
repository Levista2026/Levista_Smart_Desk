create sequence if not exists public.hr_request_ticket_seq start 1;

create table if not exists public.hr_request (
  ticket_id text primary key default 'HR-SR-' || lpad(nextval('public.hr_request_ticket_seq')::text, 4, '0'),
  employee_id text not null,
  name text not null,
  designation text not null,
  reporting_to text not null,
  mobile_no text not null,
  doj date not null,
  location text not null check (location in ('Bangalore', 'Kushal Nagar', 'Warehouse')),
  assignement_requirement text,
  handover_asset text,
  email text,
  laptop text,
  phone text,
  sim text,
  request_created_date timestamptz not null default now(),
  request_updated_date timestamptz not null default now(),
  status text default 'pending' check (status in ('pending', 'progress', 'assigned', 'collected', 'in_progress', 'resolved', 'completed'))
);

create index if not exists hr_request_status_idx on public.hr_request (status);
create index if not exists hr_request_created_date_idx on public.hr_request (request_created_date desc);

create or replace function public.set_hr_request_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.request_updated_date = now();
  return new;
end;
$$;

drop trigger if exists trg_hr_request_updated_at on public.hr_request;

create trigger trg_hr_request_updated_at
before update on public.hr_request
for each row
execute function public.set_hr_request_updated_at();
