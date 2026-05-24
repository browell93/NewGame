create table if not exists public.map_regions (
  key text primary key,
  name text not null,
  threat_level integer not null default 1 check (threat_level between 1 and 10),
  x integer not null,
  y integer not null
);

create table if not exists public.player_region_discovery (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.player_profiles(user_id) on delete cascade,
  region_key text not null references public.map_regions(key) on delete cascade,
  discovered_at timestamptz not null default now(),
  unique (player_id, region_key)
);

insert into public.map_regions (key, name, threat_level, x, y)
values
  ('frontier-01', 'Frontier Heartland', 1, 0, 0),
  ('frontier-02', 'Timber March', 2, 1, 0),
  ('frontier-03', 'Ashen Quarry', 3, 0, 1),
  ('frontier-04', 'Iron Ridge', 4, -1, 0)
on conflict (key) do nothing;

alter table public.map_regions enable row level security;
alter table public.player_region_discovery enable row level security;

create policy "Authenticated players can read map regions"
  on public.map_regions for select
  to authenticated
  using (true);

create policy "Players can read their discovered regions"
  on public.player_region_discovery for select
  to authenticated
  using (auth.uid() = player_id);

create policy "Players can create their discovered regions"
  on public.player_region_discovery for insert
  to authenticated
  with check (auth.uid() = player_id);
