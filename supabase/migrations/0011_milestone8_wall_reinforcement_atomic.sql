create or replace function public.reinforce_city_walls(p_city_id uuid)
returns void
language plpgsql
security invoker
as $$
begin
  insert into public.city_wall_state (
    city_id,
    wall_level,
    durability_current,
    durability_max,
    trap_count,
    updated_at
  )
  values (
    p_city_id,
    1,
    1000,
    1000,
    5,
    now()
  )
  on conflict (city_id) do update
    set durability_current = least(
          public.city_wall_state.durability_max,
          public.city_wall_state.durability_current + 150
        ),
        trap_count = public.city_wall_state.trap_count + 5,
        updated_at = now();
end;
$$;

grant execute on function public.reinforce_city_walls(uuid) to authenticated;
