create table if not exists public.city_inventory_items (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  item_key text not null,
  item_name text not null,
  quantity integer not null default 0 check (quantity >= 0),
  rarity text not null default 'common' check (rarity in ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  updated_at timestamptz not null default now(),
  unique (city_id, item_key)
);

create index if not exists idx_city_inventory_items_city_id on public.city_inventory_items(city_id);

alter table public.city_inventory_items enable row level security;

create policy "Players can read their inventory"
  on public.city_inventory_items for select
  to authenticated
  using (
    exists (
      select 1 from public.cities c where c.id = city_inventory_items.city_id and c.player_id = auth.uid()
    )
  );

create policy "Players can create/update their inventory"
  on public.city_inventory_items for all
  to authenticated
  using (
    exists (
      select 1 from public.cities c where c.id = city_inventory_items.city_id and c.player_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.cities c where c.id = city_inventory_items.city_id and c.player_id = auth.uid()
    )
  );
