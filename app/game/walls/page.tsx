import { redirect } from "next/navigation";
import { DashboardPanel } from "@/components/game/dashboard-panel";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { reinforceWallsAction } from "@/server/actions/walls";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";
import { getCityWallState } from "@/server/services/walls";

export default async function WallsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : null;
  const errorMessage = typeof params.error === "string" ? params.error : null;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in%20to%20open%20walls");

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) redirect("/game?error=City%20not%20found");

  const wallState = await getCityWallState(supabase as never, dashboard.city.id);
  const effective = wallState ?? { wallLevel: 1, durabilityCurrent: 1000, durabilityMax: 1000, trapCount: 0 };

  return (
    <section className="space-y-6">
      {message ? <p className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">{message}</p> : null}
      {errorMessage ? <p className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">{errorMessage}</p> : null}

      <DashboardPanel title="Wall defenses" eyebrow="Milestone 8">
        <p className="text-sm text-slate-300">Reinforce your city walls and increase trap stockpile.</p>
        <form action={reinforceWallsAction} className="mt-4">
          <button type="submit" className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">Reinforce walls</button>
        </form>
      </DashboardPanel>

      <DashboardPanel title="Defense state" eyebrow="Fortification">
        <div className="space-y-2 text-sm text-slate-200">
          <p>Wall level: {effective.wallLevel}</p>
          <p>Durability: {effective.durabilityCurrent}/{effective.durabilityMax}</p>
          <p>Traps: {effective.trapCount}</p>
        </div>
      </DashboardPanel>
    </section>
  );
}
