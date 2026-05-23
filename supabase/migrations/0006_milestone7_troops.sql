create table if not exists public.city_troop_stacks (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  troop_type text not null,
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  unique (city_id, troop_type)
);

create table if not exists public.city_troop_training_queues (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  troop_type text not null,
  quantity integer not null check (quantity > 0),
  status text not null default 'queued' check (status in ('queued', 'in_progress', 'completed', 'cancelled')),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_city_troop_stacks_city_id on public.city_troop_stacks(city_id);
create index if not exists idx_city_troop_training_queues_city_id on public.city_troop_training_queues(city_id);

alter table public.city_troop_stacks enable row level security;
alter table public.city_troop_training_queues enable row level security;

create policy "Players can read their troop stacks"
  on public.city_troop_stacks for select
  to authenticated
  using (
    exists (
      select 1 from public.cities c where c.id = city_troop_stacks.city_id and c.player_id = auth.uid()
    )
  );

create policy "Players can create/update their troop stacks"
  on public.city_troop_stacks for all
  to authenticated
  using (
    exists (
      select 1 from public.cities c where c.id = city_troop_stacks.city_id and c.player_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.cities c where c.id = city_troop_stacks.city_id and c.player_id = auth.uid()
    )
  );

create policy "Players can read their troop training queues"
  on public.city_troop_training_queues for select
  to authenticated
  using (
    exists (
      select 1 from public.cities c where c.id = city_troop_training_queues.city_id and c.player_id = auth.uid()
    )
  );

create policy "Players can create their troop training queues"
  on public.city_troop_training_queues for insert
  to authenticated
  with check (
    exists (
      select 1 from public.cities c where c.id = city_troop_training_queues.city_id and c.player_id = auth.uid()
    )
  );
