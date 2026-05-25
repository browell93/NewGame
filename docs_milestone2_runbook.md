# Milestone 2 Runbook (What to do next)

This is the fastest path to finish Milestone 2 safely.

## 1) What the code already does

Implemented in the repo now:
- Beginner protection helper logic and unit tests.
- Game dashboard displays beginner protection state.
- Expanded `/game/*` route placeholders and clickable nav links.
- SQL migration `supabase/migrations/0002_milestone2_foundation.sql` for protection fields and starter bootstrap defaults.

## 2) What **you** need to do outside the repo

### A. Apply DB migrations in Supabase
Run both migrations in order in Supabase SQL editor (or via CLI):
1. `supabase/migrations/0001_milestone1.sql`
2. `supabase/migrations/0002_milestone2_foundation.sql`

### B. Seed definitions (if not already seeded)
Run:
- `supabase/seed/0001_core_definitions.sql`

### C. Verify Vercel env vars in Production
In Vercel Project Settings → Environment Variables, ensure:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then redeploy production.

## 3) Local validation checklist

Run locally:
- `npm install`
- `npm run lint`
- `npm run test`
- `npm run build`

Manual checks:
1. Sign up a brand new user and open `/game`.
2. Confirm first load creates exactly one starter city.
3. Refresh `/game` several times; confirm no duplicate city appears.
4. Confirm protection label appears on dashboard.
5. Open all nav pages:
   - `/game/buildings`
   - `/game/resources`
   - `/game/research`
   - `/game/heroes`
   - `/game/troops`
   - `/game/walls`
   - `/game/map`
   - `/game/reports`
   - `/game/alliance`
   - `/game/inventory`

## 4) Remaining Milestone 2 gaps to implement next

1. Region assignment refinement beyond static `frontier-01`.
2. Explicit early-break trigger wiring (when gameplay actions should end protection).
3. A lightweight integration test around starter bootstrap idempotency (against a test DB).

If you want, the next PR can focus only on those 3 items.
