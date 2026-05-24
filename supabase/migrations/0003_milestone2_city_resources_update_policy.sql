alter table public.city_resources
  add column if not exists gold_fraction double precision not null default 0,
  add column if not exists food_fraction double precision not null default 0,
  add column if not exists lumber_fraction double precision not null default 0,
  add column if not exists stone_fraction double precision not null default 0,
  add column if not exists iron_fraction double precision not null default 0;

create policy "Players can update their city resources"
  on public.city_resources for update
  to authenticated
  using (
    exists (
      select 1
      from public.cities c
      where c.id = city_resources.city_id
        and c.player_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.cities c
      where c.id = city_resources.city_id
        and c.player_id = auth.uid()
    )
  );
