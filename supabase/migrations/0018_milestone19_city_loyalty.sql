create table if not exists public.city_loyalty_events (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  event_type text not null,
  loyalty_delta integer not null,
  unrest_delta integer not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_city_loyalty_events_city_id on public.city_loyalty_events(city_id);

alter table public.city_loyalty_events enable row level security;

create policy "Players can read their city loyalty events"
  on public.city_loyalty_events for select
  to authenticated
  using (
    exists (
      select 1 from public.cities c where c.id = city_loyalty_events.city_id and c.player_id = auth.uid()
    )
  );

create policy "Players can create their city loyalty events"
  on public.city_loyalty_events for insert
  to authenticated
  with check (
    exists (
      select 1 from public.cities c where c.id = city_loyalty_events.city_id and c.player_id = auth.uid()
    )
  );
