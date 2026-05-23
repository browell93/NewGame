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
