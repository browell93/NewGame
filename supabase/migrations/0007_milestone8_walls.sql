create table if not exists public.city_wall_state (
  city_id uuid primary key references public.cities(id) on delete cascade,
  wall_level integer not null default 1 check (wall_level >= 1),
  durability_current integer not null default 1000 check (durability_current >= 0),
  durability_max integer not null default 1000 check (durability_max >= 0),
  trap_count integer not null default 0 check (trap_count >= 0),
  updated_at timestamptz not null default now(),
  check (durability_current <= durability_max)
);

alter table public.city_wall_state enable row level security;

create policy "Players can read their wall state"
  on public.city_wall_state for select
  to authenticated
  using (
    exists (
      select 1 from public.cities c where c.id = city_wall_state.city_id and c.player_id = auth.uid()
    )
  );

create policy "Players can create/update their wall state"
  on public.city_wall_state for all
  to authenticated
  using (
    exists (
      select 1 from public.cities c where c.id = city_wall_state.city_id and c.player_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.cities c where c.id = city_wall_state.city_id and c.player_id = auth.uid()
    )
  );
