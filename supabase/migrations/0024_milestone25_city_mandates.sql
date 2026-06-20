create table if not exists public.city_mandates (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  mandate_key text not null,
  loyalty_delta integer not null default 0,
  unrest_delta integer not null default 0,
  tax_rate_delta integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_city_mandates_city_id_created_at
  on public.city_mandates(city_id, created_at desc);

alter table public.city_mandates enable row level security;

drop policy if exists city_mandates_select_own on public.city_mandates;
create policy city_mandates_select_own
on public.city_mandates
for select
using (
  exists (
    select 1
    from public.cities c
    where c.id = city_mandates.city_id
      and c.owner_user_id = auth.uid()
  )
);

drop policy if exists city_mandates_insert_own on public.city_mandates;
create policy city_mandates_insert_own
on public.city_mandates
for insert
with check (
  exists (
    select 1
    from public.cities c
    where c.id = city_mandates.city_id
      and c.owner_user_id = auth.uid()
  )
);
