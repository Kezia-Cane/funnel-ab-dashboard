create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.ab_tests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  test_key text not null,
  description text,
  status text not null default 'draft',
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ab_tests_name_check check (btrim(name) <> ''),
  constraint ab_tests_test_key_check check (btrim(test_key) <> ''),
  constraint ab_tests_test_key_key unique (test_key),
  constraint ab_tests_status_check check (status in ('draft', 'active', 'completed')),
  constraint ab_tests_date_range_check check (
    end_date is null
    or start_date is null
    or end_date >= start_date
  )
);

create table public.ab_variants (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null,
  variant_key text not null,
  headline text,
  subheadline text,
  is_control boolean not null default false,
  created_at timestamptz not null default now(),
  constraint ab_variants_test_id_fkey
    foreign key (test_id)
    references public.ab_tests (id)
    on delete cascade,
  constraint ab_variants_variant_key_check check (btrim(variant_key) <> ''),
  constraint ab_variants_test_id_variant_key_key unique (test_id, variant_key),
  constraint ab_variants_test_id_id_key unique (test_id, id)
);

create table public.ab_events (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null,
  variant_id uuid not null,
  event_type text not null,
  page_url text,
  page_path text,
  user_agent text,
  revenue_value numeric,
  metadata jsonb,
  created_at timestamptz not null default now(),
  constraint ab_events_test_id_fkey
    foreign key (test_id)
    references public.ab_tests (id)
    on delete cascade,
  constraint ab_events_variant_id_fkey
    foreign key (variant_id)
    references public.ab_variants (id)
    on delete cascade,
  constraint ab_events_test_variant_fkey
    foreign key (test_id, variant_id)
    references public.ab_variants (test_id, id)
    on delete cascade,
  constraint ab_events_event_type_check check (
    event_type in ('page_view', 'cta_click', 'purchase')
  ),
  constraint ab_events_revenue_value_check check (
    revenue_value is null or revenue_value >= 0
  )
);

create trigger trg_ab_tests_set_updated_at
before update on public.ab_tests
for each row
execute function public.set_updated_at();

create index ab_events_test_id_idx on public.ab_events (test_id);
create index ab_events_variant_id_idx on public.ab_events (variant_id);
create index ab_events_event_type_idx on public.ab_events (event_type);
create index ab_events_created_at_idx on public.ab_events (created_at);

alter table public.ab_tests enable row level security;
alter table public.ab_variants enable row level security;
alter table public.ab_events enable row level security;

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.ab_tests to anon, authenticated;
grant select, insert, update, delete on public.ab_variants to anon, authenticated;
grant select, insert, update, delete on public.ab_events to anon, authenticated;

create policy ab_tests_dev_all
on public.ab_tests
for all
to anon, authenticated
using (true)
with check (true);

create policy ab_variants_dev_all
on public.ab_variants
for all
to anon, authenticated
using (true)
with check (true);

create policy ab_events_dev_all
on public.ab_events
for all
to anon, authenticated
using (true)
with check (true);
