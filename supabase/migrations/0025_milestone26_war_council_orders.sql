create table if not exists public.city_war_orders (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.player_profiles(user_id) on delete cascade,
  city_id uuid not null references public.cities(id) on delete cascade,
  order_key text not null,
  target_region_key text not null references public.map_regions(key) on delete restrict,
  troop_type text not null default 'militia',
  troop_quantity integer not null check (troop_quantity > 0),
  status text not null default 'planned' check (status in ('planned', 'mobilizing', 'resolved', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists idx_city_war_orders_player_id_created_at
  on public.city_war_orders(player_id, created_at desc);
create index if not exists idx_city_war_orders_city_id
  on public.city_war_orders(city_id);

alter table public.city_war_orders enable row level security;

create policy "Players can read their war orders"
  on public.city_war_orders for select
  to authenticated
  using (auth.uid() = player_id);

create policy "Players can create their war orders"
  on public.city_war_orders for insert
  to authenticated
  with check (auth.uid() = player_id);

create policy "Players can update their war orders"
  on public.city_war_orders for update
  to authenticated
  using (auth.uid() = player_id)
  with check (auth.uid() = player_id);
