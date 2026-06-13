create table if not exists public.alliances (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 3 and 48),
  tag text not null unique check (char_length(tag) between 2 and 8),
  leader_player_id uuid not null references public.player_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.alliance_members (
  id uuid primary key default gen_random_uuid(),
  alliance_id uuid not null references public.alliances(id) on delete cascade,
  player_id uuid not null references public.player_profiles(user_id) on delete cascade,
  role text not null default 'member' check (role in ('leader', 'officer', 'member')),
  joined_at timestamptz not null default now(),
  unique (alliance_id, player_id),
  unique (player_id)
);

create table if not exists public.alliance_messages (
  id uuid primary key default gen_random_uuid(),
  alliance_id uuid not null references public.alliances(id) on delete cascade,
  sender_player_id uuid not null references public.player_profiles(user_id) on delete cascade,
  body text not null check (char_length(body) between 1 and 300),
  created_at timestamptz not null default now()
);

create index if not exists idx_alliance_members_alliance_id on public.alliance_members(alliance_id);
create index if not exists idx_alliance_messages_alliance_id on public.alliance_messages(alliance_id);

alter table public.alliances enable row level security;
alter table public.alliance_members enable row level security;
alter table public.alliance_messages enable row level security;

create policy "Authenticated players can read alliances"
  on public.alliances for select
  to authenticated
  using (true);

create policy "Players can create alliances"
  on public.alliances for insert
  to authenticated
  with check (auth.uid() = leader_player_id);

create policy "Players can read alliance members"
  on public.alliance_members for select
  to authenticated
  using (
    exists (
      select 1 from public.alliance_members am where am.alliance_id = alliance_members.alliance_id and am.player_id = auth.uid()
    )
  );

create policy "Players can create their own member row"
  on public.alliance_members for insert
  to authenticated
  with check (auth.uid() = player_id);

create policy "Players can read alliance messages"
  on public.alliance_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.alliance_members am where am.alliance_id = alliance_messages.alliance_id and am.player_id = auth.uid()
    )
  );

create policy "Alliance members can post messages"
  on public.alliance_messages for insert
  to authenticated
  with check (
    auth.uid() = sender_player_id and
    exists (
      select 1 from public.alliance_members am where am.alliance_id = alliance_messages.alliance_id and am.player_id = auth.uid()
    )
  );
