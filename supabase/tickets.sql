create sequence if not exists public.tickets_ticket_seq start 1;

create table if not exists public.tickets (
  id text primary key default '#INSTKT' || lpad(nextval('public.tickets_ticket_seq')::text, 4, '0'),
  title text not null,
  requester text not null,
  employee_id text not null,
  department text not null,
  mobile text not null,
  email text not null,
  category text not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  description text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'resolved')),
  assignee text,
  resolution_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tickets_status_idx on public.tickets (status);
create index if not exists tickets_created_at_idx on public.tickets (created_at desc);

create or replace function public.set_tickets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tickets_updated_at on public.tickets;

create trigger trg_tickets_updated_at
before update on public.tickets
for each row
execute function public.set_tickets_updated_at();
