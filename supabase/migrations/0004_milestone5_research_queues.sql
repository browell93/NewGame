create table if not exists public.city_research_queues (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  research_key text not null,
  target_level integer not null check (target_level >= 1),
  status text not null default 'queued' check (status in ('queued', 'in_progress', 'completed', 'cancelled')),
  started_at timestamptz,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (city_id, research_key, target_level)
);

create index if not exists idx_city_research_queues_city_id on public.city_research_queues(city_id);
create index if not exists idx_city_research_queues_status on public.city_research_queues(status);

alter table public.city_research_queues enable row level security;

create policy "Players can read their research queues"
  on public.city_research_queues for select
  to authenticated
  using (
    exists (
      select 1
      from public.cities c
      where c.id = city_research_queues.city_id
        and c.player_id = auth.uid()
    )
  );

create policy "Players can create their research queues"
  on public.city_research_queues for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.cities c
      where c.id = city_research_queues.city_id
        and c.player_id = auth.uid()
    )
  );
