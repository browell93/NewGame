import { redirect } from "next/navigation";
import { DashboardPanel } from "@/components/game/dashboard-panel";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { queueMilitiaTrainingAction } from "@/server/actions/troops";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";
import { getCityTroops } from "@/server/services/troops";

export default async function TroopsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : null;
  const errorMessage = typeof params.error === "string" ? params.error : null;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in%20to%20open%20troops");

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) redirect("/game?error=City%20not%20found");

  const troopState = await getCityTroops(supabase as never, dashboard.city.id);

  return (
    <section className="space-y-6">
      {message ? <p className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">{message}</p> : null}
      {errorMessage ? <p className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">{errorMessage}</p> : null}

      <DashboardPanel title="Troop training" eyebrow="Milestone 7">
        <p className="text-sm text-slate-300">Queue militia training to validate troop production flow.</p>
        <form action={queueMilitiaTrainingAction} className="mt-4">
          <button type="submit" className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">Queue 25 Militia</button>
        </form>
      </DashboardPanel>

      <DashboardPanel title="Troop stacks" eyebrow="City army">
        {troopState.stacks.length === 0 ? <p className="text-sm text-slate-300">No troops yet.</p> : (
          <div className="space-y-2">{troopState.stacks.map((s) => <article key={s.troopType} className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">{s.troopType}: {s.quantity}</article>)}</div>
        )}
      </DashboardPanel>

      <DashboardPanel title="Training queue" eyebrow="Queue state">
        {troopState.queues.length === 0 ? <p className="text-sm text-slate-300">No training queued.</p> : (
          <div className="space-y-2">{troopState.queues.map((q) => <article key={q.id} className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">{q.troopType} x{q.quantity} ({q.status}) • ends {new Date(q.endsAt).toLocaleString()}</article>)}</div>
        )}
      </DashboardPanel>
    </section>
  );
}
