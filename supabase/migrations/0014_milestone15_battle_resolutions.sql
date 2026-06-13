create table if not exists public.march_battle_resolutions (
  id uuid primary key default gen_random_uuid(),
  march_id uuid not null unique references public.city_marches(id) on delete cascade,
  player_id uuid not null references public.player_profiles(user_id) on delete cascade,
  outcome text not null check (outcome in ('victory', 'defeat', 'stalemate')),
  attacker_losses integer not null default 0 check (attacker_losses >= 0),
  defender_losses integer not null default 0 check (defender_losses >= 0),
  loot_food integer not null default 0 check (loot_food >= 0),
  resolved_at timestamptz not null default now()
);

create index if not exists idx_march_battle_resolutions_player_id on public.march_battle_resolutions(player_id);

alter table public.march_battle_resolutions enable row level security;

create policy "Players can read their battle resolutions"
  on public.march_battle_resolutions for select
  to authenticated
  using (auth.uid() = player_id);

create policy "Players can create their battle resolutions"
  on public.march_battle_resolutions for insert
  to authenticated
  with check (auth.uid() = player_id);
