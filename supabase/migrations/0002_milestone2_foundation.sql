alter table public.player_profiles
  add column if not exists home_region_key text not null default 'frontier-01',
  add column if not exists beginner_protection_started_at timestamptz not null default now(),
  add column if not exists beginner_protection_ends_at timestamptz not null default (now() + interval '72 hours'),
  add column if not exists protection_break_reason text;

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
  v_region_key text;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'Cannot bootstrap a starter city for another user.' using errcode = '42501';
  end if;

  v_display_name := left(coalesce(nullif(trim(p_display_name), ''), 'Frontier Ruler'), 32);
  v_region_key := 'frontier-01';

  insert into public.player_profiles (
    user_id,
    display_name,
    home_region_key,
    beginner_protection_started_at,
    beginner_protection_ends_at,
    protection_break_reason
  )
  values (
    p_user_id,
    v_display_name,
    v_region_key,
    now(),
    now() + interval '72 hours',
    null
  )
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
  values (p_user_id, v_display_name || '''s Holdfast', v_region_key, true)
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
