create or replace function public.is_alliance_member(target_alliance_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.alliance_members am
    where am.alliance_id = target_alliance_id
      and am.player_id = auth.uid()
  );
$$;

revoke all on function public.is_alliance_member(uuid) from public;
grant execute on function public.is_alliance_member(uuid) to authenticated;

drop policy if exists "Players can read alliance members" on public.alliance_members;
create policy "Players can read alliance members"
  on public.alliance_members for select
  to authenticated
  using (public.is_alliance_member(alliance_id));

drop policy if exists "Players can read alliance messages" on public.alliance_messages;
create policy "Players can read alliance messages"
  on public.alliance_messages for select
  to authenticated
  using (public.is_alliance_member(alliance_id));

drop policy if exists "Alliance members can post messages" on public.alliance_messages;
create policy "Alliance members can post messages"
  on public.alliance_messages for insert
  to authenticated
  with check (
    auth.uid() = sender_player_id and
    public.is_alliance_member(alliance_id)
  );

create or replace function public.reinforce_city_walls(target_city_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.city_wall_state (
    city_id,
    wall_level,
    durability_current,
    durability_max,
    trap_count,
    updated_at
  )
  values (
    target_city_id,
    1,
    1000,
    1000,
    5,
    now()
  )
  on conflict (city_id) do update
  set durability_current = least(city_wall_state.durability_max, city_wall_state.durability_current + 150),
      trap_count = city_wall_state.trap_count + 5,
      updated_at = now();
$$;
