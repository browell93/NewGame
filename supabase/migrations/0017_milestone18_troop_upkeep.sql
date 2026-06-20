create table if not exists public.city_troop_upkeep_state (
  city_id uuid primary key references public.cities(id) on delete cascade,
  hourly_food_upkeep integer not null default 0 check (hourly_food_upkeep >= 0),
  last_calculated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.city_troop_upkeep_state enable row level security;

create policy "Players can read their troop upkeep"
  on public.city_troop_upkeep_state for select
  to authenticated
  using (
    exists (
      select 1 from public.cities c where c.id = city_troop_upkeep_state.city_id and c.player_id = auth.uid()
    )
  );

create policy "Players can create/update their troop upkeep"
  on public.city_troop_upkeep_state for all
  to authenticated
  using (
    exists (
      select 1 from public.cities c where c.id = city_troop_upkeep_state.city_id and c.player_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.cities c where c.id = city_troop_upkeep_state.city_id and c.player_id = auth.uid()
    )
  );
