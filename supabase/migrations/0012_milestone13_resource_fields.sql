create table if not exists public.resource_field_upgrade_queues (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  field_id uuid not null references public.resource_fields(id) on delete cascade,
  target_level integer not null check (target_level >= 1),
  status text not null default 'queued' check (status in ('queued', 'in_progress', 'completed', 'cancelled')),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_resource_field_upgrade_queues_city_id on public.resource_field_upgrade_queues(city_id);

alter table public.resource_field_upgrade_queues enable row level security;

create policy "Players can read their field upgrade queues"
  on public.resource_field_upgrade_queues for select
  to authenticated
  using (
    exists (
      select 1 from public.cities c where c.id = resource_field_upgrade_queues.city_id and c.player_id = auth.uid()
    )
  );

create policy "Players can create their field upgrade queues"
  on public.resource_field_upgrade_queues for insert
  to authenticated
  with check (
    exists (
      select 1 from public.cities c where c.id = resource_field_upgrade_queues.city_id and c.player_id = auth.uid()
    )
  );
