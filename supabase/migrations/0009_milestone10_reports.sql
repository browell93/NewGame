create table if not exists public.player_reports (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.player_profiles(user_id) on delete cascade,
  report_type text not null,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_player_reports_player_id on public.player_reports(player_id);
create index if not exists idx_player_reports_created_at on public.player_reports(created_at desc);

alter table public.player_reports enable row level security;

create policy "Players can read their reports"
  on public.player_reports for select
  to authenticated
  using (auth.uid() = player_id);

create policy "Players can create their reports"
  on public.player_reports for insert
  to authenticated
  with check (auth.uid() = player_id);

create policy "Players can update their reports"
  on public.player_reports for update
  to authenticated
  using (auth.uid() = player_id)
  with check (auth.uid() = player_id);
