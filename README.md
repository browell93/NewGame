# Kingdoms of Ash — Milestone 1

A production-minded **Next.js + Supabase** foundation for an original browser-first medieval city / castle builder. This repository implements **Milestone 1** of the project brief:

- Next.js App Router + TypeScript + Tailwind UI shell
- Supabase server/browser client wiring
- Sign up, sign in, and sign out actions
- Protected `/game` route
- Transaction-safe, idempotent first-login player + city bootstrap via PostgreSQL RPC
- Core schema migrations and seed data
- Starter city dashboard with resources, population, starting buildings, and placeholders for future systems
- Unit tests for resource math and the starter-city bootstrap service

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- Vitest

## Project structure

```text
/app                         App Router pages
  /auth/sign-in              Sign-in page
  /auth/sign-up              Sign-up page
  /game                      Protected game shell + dashboard
/components/game             Dashboard UI pieces
/lib/game                    Shared game math helpers
/lib/supabase                Browser/server/middleware Supabase clients
/server/actions              Server actions such as auth
/server/services             Bootstrap and dashboard data loading
/supabase/migrations         SQL schema + RPC migration
/supabase/seed               Definition seed data
/tests/unit                  Vitest unit coverage
```

## 1. Create a Supabase project

Create a Supabase project, then copy the project URL and anon key into a local `.env.local` file:

```bash
cp .env.example .env.local
```

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 2. Install dependencies

```bash
npm install
```

## 3. Apply the database migration

Use the Supabase SQL editor or the Supabase CLI to run:

```text
supabase/migrations/0001_milestone1.sql
```

The migration creates:

- `player_profiles`
- `cities`
- `city_resources`
- `city_population_state`
- `building_definitions`
- `city_buildings`
- `resource_field_definitions`
- `resource_fields`
- Row-level security policies
- `create_starter_city_for_user(...)` RPC function

## 4. Seed building and resource definitions

Run:

```text
supabase/seed/0001_core_definitions.sql
```

The seed file inserts initial building definitions and field definitions used by the dashboard and starter bootstrap.

## 5. Start the app locally

```bash
npm run dev
```

Open the local app in your browser, create an account, sign in, and visit `/game`.

On first authenticated entry to `/game`, the app calls the transaction-safe RPC function to:

1. Create or update the player profile.
2. Create one capital city if it does not already exist.
3. Insert starter resources and population.
4. Insert starter buildings.
5. Insert four initial resource plots.

## 6. Run validation

```bash
npm run lint
npm run test
npm run build
```

## 7. Vercel deployment notes

Set the same two environment variables in Vercel for every deployment environment you intend to use:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Preview and Production can point to separate Supabase projects when you are ready to isolate staging data.

## Current milestone boundary

Milestone 1 intentionally stops after the authenticated city foundation. The following are represented only as UI placeholders or future schema-ready concepts:

- Resource accrual over time
- Building upgrade queues
- Research queues
- Heroes
- Troops
- Walls / fortifications
- World map
- Marches and battle reports
- Alliances and chat

## Suggested next build

Move to **Milestone 2** next:

- Polish player / city creation flows
- Region assignment refinements
- Beginner protection state
- Expanded navigation
- Tests for protection expiration rules

## Vercel Redeploy Checklist

1. Copy `.env.example` to `.env.local` for local development.
2. In Vercel project settings, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Ensure Vercel uses Node `22.x` and npm `10.x` (from `package.json`).
4. Trigger a redeploy from the latest `main` commit.

This repository includes `vercel.json` with `npm ci` for deterministic installs.

