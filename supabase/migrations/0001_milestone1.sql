create extension if not exists pgcrypto;

create table if not exists public.player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.player_profiles(user_id) on delete cascade,
  name text not null check (char_length(name) between 1 and 48),
  region_key text not null default 'frontier-01',
  is_capital boolean not null default true,
  created_at timestamptz not null default now(),
  unique (player_id)
);

create table if not exists public.city_resources (
  city_id uuid primary key references public.cities(id) on delete cascade,
  gold bigint not null default 1000 check (gold >= 0),
  food bigint not null default 5000 check (food >= 0),
  lumber bigint not null default 3000 check (lumber >= 0),
  stone bigint not null default 2500 check (stone >= 0),
  iron bigint not null default 1500 check (iron >= 0),
  last_collected_at timestamptz not null default now()
);

create table if not exists public.city_population_state (
  city_id uuid primary key references public.cities(id) on delete cascade,
  max_population integer not null default 500 check (max_population >= 0),
  current_population integer not null default 420 check (current_population >= 0),
  idle_population integer not null default 260 check (idle_population >= 0),
  tax_rate smallint not null default 10 check (tax_rate between 0 and 100),
  loyalty smallint not null default 90 check (loyalty between 0 and 100),
  unrest smallint not null default 0 check (unrest between 0 and 100),
  updated_at timestamptz not null default now(),
  check (current_population <= max_population),
  check (idle_population <= current_population)
);

create table if not exists public.building_definitions (
  key text primary key,
  name text not null,
  category text not null,
  description text not null default '',
  base_build_seconds integer not null default 60 check (base_build_seconds >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.city_buildings (
  city_id uuid not null references public.cities(id) on delete cascade,
  building_key text not null references public.building_definitions(key) on delete restrict,
  level integer not null default 0 check (level >= 0),
  updated_at timestamptz not null default now(),
  primary key (city_id, building_key)
);

create table if not exists public.resource_field_definitions (
  key text primary key,
  name text not null,
  resource_key text not null check (resource_key in ('food', 'lumber', 'stone', 'iron')),
  description text not null default '',
  base_output_per_hour integer not null default 0 check (base_output_per_hour >= 0),
  workforce_required integer not null default 0 check (workforce_required >= 0),
  base_upgrade_seconds integer not null default 60 check (base_upgrade_seconds >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.resource_fields (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  field_key text not null references public.resource_field_definitions(key) on delete restrict,
  plot_index integer not null check (plot_index >= 1),
  level integer not null default 1 check (level >= 0),
  created_at timestamptz not null default now(),
  unique (city_id, plot_index)
);

create index if not exists idx_cities_player_id on public.cities(player_id);
create index if not exists idx_city_buildings_city_id on public.city_buildings(city_id);
create index if not exists idx_resource_fields_city_id on public.resource_fields(city_id);

alter table public.player_profiles enable row level security;
alter table public.cities enable row level security;
alter table public.city_resources enable row level security;
alter table public.city_population_state enable row level security;
alter table public.building_definitions enable row level security;
alter table public.city_buildings enable row level security;
alter table public.resource_field_definitions enable row level security;
alter table public.resource_fields enable row level security;

create policy "Players can read their profile"
  on public.player_profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Players can update their profile"
  on public.player_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Players can read their city"
  on public.cities for select
  to authenticated
  using (auth.uid() = player_id);

create policy "Players can read their city resources"
  on public.city_resources for select
  to authenticated
  using (
    exists (
      select 1
      from public.cities c
      where c.id = city_resources.city_id
        and c.player_id = auth.uid()
    )
  );

create policy "Players can read their city population"
  on public.city_population_state for select
  to authenticated
  using (
    exists (
      select 1
      from public.cities c
      where c.id = city_population_state.city_id
        and c.player_id = auth.uid()
    )
  );

create policy "Authenticated players can read building definitions"
  on public.building_definitions for select
  to authenticated
  using (true);

create policy "Players can read their city buildings"
  on public.city_buildings for select
  to authenticated
  using (
    exists (
      select 1
      from public.cities c
      where c.id = city_buildings.city_id
        and c.player_id = auth.uid()
    )
  );

create policy "Authenticated players can read resource field definitions"
  on public.resource_field_definitions for select
  to authenticated
  using (true);

create policy "Players can read their resource fields"
  on public.resource_fields for select
  to authenticated
  using (
    exists (
      select 1
      from public.cities c
      where c.id = resource_fields.city_id
        and c.player_id = auth.uid()
    )
  );

create or replace function public.create_starter_city_for_user(
  p_user_id uuid,
  p_display_name text
)
returns table(city_id uuid, created boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_city_id uuid;
  v_display_name text;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'Cannot bootstrap a starter city for another user.' using errcode = '42501';
  end if;

  v_display_name := left(coalesce(nullif(trim(p_display_name), ''), 'Frontier Ruler'), 32);

  insert into public.player_profiles (user_id, display_name)
  values (p_user_id, v_display_name)
  on conflict (user_id) do update
    set display_name = excluded.display_name,
        updated_at = now();

  select c.id
    into v_city_id
  from public.cities c
  where c.player_id = p_user_id
  limit 1;

  if v_city_id is not null then
    city_id := v_city_id;
    created := false;
    return next;
    return;
  end if;

  insert into public.cities (player_id, name, region_key, is_capital)
  values (p_user_id, v_display_name || '''s Holdfast', 'frontier-01', true)
  returning id into v_city_id;

  insert into public.city_resources (city_id, gold, food, lumber, stone, iron)
  values (v_city_id, 1000, 5000, 3000, 2500, 1500);

  insert into public.city_population_state (
    city_id,
    max_population,
    current_population,
    idle_population,
    tax_rate,
    loyalty,
    unrest
  )
  values (v_city_id, 500, 420, 260, 10, 90, 0);

  insert into public.city_buildings (city_id, building_key, level)
  values
    (v_city_id, 'town_hall', 1),
    (v_city_id, 'cottage', 1),
    (v_city_id, 'warehouse', 1),
    (v_city_id, 'academy', 1),
    (v_city_id, 'barracks', 1);

  insert into public.resource_fields (city_id, field_key, plot_index, level)
  values
    (v_city_id, 'farm', 1, 1),
    (v_city_id, 'sawmill', 2, 1),
    (v_city_id, 'quarry', 3, 1),
    (v_city_id, 'iron_mine', 4, 1);

  city_id := v_city_id;
  created := true;
  return next;
end;
$$;

grant execute on function public.create_starter_city_for_user(uuid, text) to authenticated;
