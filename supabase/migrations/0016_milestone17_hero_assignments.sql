create table if not exists public.city_hero_assignments (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  hero_id uuid not null references public.city_heroes(id) on delete cascade,
  assignment_type text not null check (assignment_type in ('governance', 'resource_boost', 'military_drill')),
  assigned_at timestamptz not null default now(),
  unique (hero_id)
);

create index if not exists idx_city_hero_assignments_city_id on public.city_hero_assignments(city_id);

alter table public.city_hero_assignments enable row level security;

create policy "Players can read their hero assignments"
  on public.city_hero_assignments for select
  to authenticated
  using (
    exists (
      select 1 from public.cities c where c.id = city_hero_assignments.city_id and c.player_id = auth.uid()
    )
  );

create policy "Players can create/update their hero assignments"
  on public.city_hero_assignments for all
  to authenticated
  using (
    exists (
      select 1 from public.cities c where c.id = city_hero_assignments.city_id and c.player_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.cities c where c.id = city_hero_assignments.city_id and c.player_id = auth.uid()
    )
  );
