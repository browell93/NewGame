create table if not exists public.city_heroes (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 48),
  role text not null default 'governor',
  level integer not null default 1 check (level >= 1),
  assigned_building_key text,
  created_at timestamptz not null default now(),
  unique (city_id, name)
);

create index if not exists idx_city_heroes_city_id on public.city_heroes(city_id);

alter table public.city_heroes enable row level security;

create policy "Players can read their heroes"
  on public.city_heroes for select
  to authenticated
  using (
    exists (
      select 1
      from public.cities c
      where c.id = city_heroes.city_id
        and c.player_id = auth.uid()
    )
  );

create policy "Players can create their heroes"
  on public.city_heroes for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.cities c
      where c.id = city_heroes.city_id
        and c.player_id = auth.uid()
    )
  );
