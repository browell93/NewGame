create table if not exists public.city_edicts (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  edict_key text not null,
  loyalty_delta integer not null default 0,
  unrest_delta integer not null default 0,
  tax_rate_delta integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_city_edicts_city_id_created_at
  on public.city_edicts(city_id, created_at desc);

alter table public.city_edicts enable row level security;

drop policy if exists city_edicts_select_own on public.city_edicts;
create policy city_edicts_select_own
on public.city_edicts
for select
using (
  exists (
    select 1
    from public.cities c
    where c.id = city_edicts.city_id
      and c.owner_user_id = auth.uid()
  )
);

drop policy if exists city_edicts_insert_own on public.city_edicts;
create policy city_edicts_insert_own
on public.city_edicts
for insert
with check (
  exists (
    select 1
    from public.cities c
    where c.id = city_edicts.city_id
      and c.owner_user_id = auth.uid()
  )
);
