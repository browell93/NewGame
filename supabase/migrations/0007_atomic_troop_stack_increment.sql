create or replace function public.increment_city_troop_stack(
  p_city_id uuid,
  p_troop_type text,
  p_quantity_delta integer
)
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.city_troop_stacks (city_id, troop_type, quantity, updated_at)
  values (p_city_id, p_troop_type, p_quantity_delta, now())
  on conflict (city_id, troop_type)
  do update
    set quantity = city_troop_stacks.quantity + excluded.quantity,
        updated_at = now();
$$;
