create table if not exists public."Hr_request" (
  id text primary key,
  query_type text not null check (query_type in ('it_issue', 'new_employee', 'exit_employee')),
  employee_id text not null,
  employee_name text not null,
  designation text not null,
  reporting_to text not null,
  mobile_number text not null,
  doj date not null,
  location text not null check (location in ('Bangalore', 'Kushal Nagar', 'Warehouse')),
  assign_requirement text not null check (
    assign_requirement in (
      'E-mail Creation',
      'Laptop Allocation',
      'E-mail Creation, Laptop Allocation',
      'Laptop Allocation, E-mail Creation'
    )
  ),
  remarks text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  official_email text,
  laptop_allocation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hr_request_status_idx on public."Hr_request" (status);
create index if not exists hr_request_created_at_idx on public."Hr_request" (created_at desc);

create or replace function public.set_hr_request_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_hr_request_updated_at on public."Hr_request";

create trigger trg_hr_request_updated_at
before update on public."Hr_request"
for each row
execute function public.set_hr_request_updated_at();
