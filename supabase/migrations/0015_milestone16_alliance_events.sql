create table if not exists public.alliance_events (
  id uuid primary key default gen_random_uuid(),
  alliance_id uuid not null references public.alliances(id) on delete cascade,
  event_type text not null,
  actor_player_id uuid not null references public.player_profiles(user_id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_alliance_events_alliance_id on public.alliance_events(alliance_id);

alter table public.alliance_events enable row level security;

create policy "Alliance members can read alliance events"
  on public.alliance_events for select
  to authenticated
  using (
    exists (
      select 1 from public.alliance_members am
      where am.alliance_id = alliance_events.alliance_id
        and am.player_id = auth.uid()
    )
  );

create policy "Alliance members can create alliance events"
  on public.alliance_events for insert
  to authenticated
  with check (
    auth.uid() = actor_player_id and
    exists (
      select 1 from public.alliance_members am
      where am.alliance_id = alliance_events.alliance_id
        and am.player_id = auth.uid()
    )
  );
