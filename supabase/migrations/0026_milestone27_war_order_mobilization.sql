alter table if exists public.city_marches
  add column if not exists war_order_id uuid references public.city_war_orders(id) on delete set null;

create index if not exists idx_city_marches_war_order_id
  on public.city_marches(war_order_id);
