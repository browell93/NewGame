create table if not exists public.city_marches (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.player_profiles(user_id) on delete cascade,
  origin_city_id uuid not null references public.cities(id) on delete cascade,
  destination_region_key text not null references public.map_regions(key) on delete restrict,
  troop_type text not null,
  troop_quantity integer not null check (troop_quantity > 0),
  status text not null default 'outbound' check (status in ('outbound', 'arrived', 'returning', 'returned', 'cancelled')),
  departs_at timestamptz not null default now(),
  arrives_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_city_marches_player_id on public.city_marches(player_id);
create index if not exists idx_city_marches_origin_city_id on public.city_marches(origin_city_id);

alter table public.city_marches enable row level security;

create policy "Players can read their marches"
  on public.city_marches for select
  to authenticated
  using (auth.uid() = player_id);

create policy "Players can create their marches"
  on public.city_marches for insert
  to authenticated
  with check (auth.uid() = player_id);

create policy "Players can update their marches"
  on public.city_marches for update
  to authenticated
  using (auth.uid() = player_id)
  with check (auth.uid() = player_id);
