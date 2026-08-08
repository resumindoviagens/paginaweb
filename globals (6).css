create extension if not exists pgcrypto;

drop table if exists audit_logs;
drop table if exists form_responses;
drop table if exists clients;

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cpf text not null unique,
  birth_date date not null,
  phone text,
  email text,
  notes text,
  access_token text not null unique,
  status text not null default 'not_started',
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table form_responses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references clients(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table clients enable row level security;
alter table form_responses enable row level security;
alter table audit_logs enable row level security;

revoke all on table clients from anon, authenticated;
revoke all on table form_responses from anon, authenticated;
revoke all on table audit_logs from anon, authenticated;
