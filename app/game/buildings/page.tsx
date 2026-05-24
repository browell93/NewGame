import { redirect } from "next/navigation";
import { DashboardPanel } from "@/components/game/dashboard-panel";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { queueTownHallUpgradeAction } from "@/server/actions/buildings";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";
import { getCityBuildQueues } from "@/server/services/build-queues";

export default async function BuildingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : null;
  const errorMessage = typeof params.error === "string" ? params.error : null;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?error=Please%20sign%20in%20to%20open%20buildings");
  }

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) {
    redirect("/game?error=City%20not%20found");
  }

  const queues = await getCityBuildQueues(supabase as never, dashboard.city.id);

  return (
    <section className="space-y-6">
      {message ? <p className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">{message}</p> : null}
      {errorMessage ? <p className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">{errorMessage}</p> : null}

      <DashboardPanel title="Building queues" eyebrow="Milestone 4">
        <p className="text-sm text-slate-300">Queue your first Town Hall upgrade to validate the construction queue pipeline.</p>
        <form action={queueTownHallUpgradeAction} className="mt-4">
          <button type="submit" className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">
            Queue Town Hall +1
          </button>
        </form>
      </DashboardPanel>

      <DashboardPanel title="Active and queued upgrades" eyebrow="Queue state">
        {queues.length === 0 ? (
          <p className="text-sm text-slate-300">No queued upgrades yet.</p>
        ) : (
          <div className="space-y-2">
            {queues.map((q) => (
              <article key={q.id} className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">
                {q.buildingKey} → Lv. {q.targetLevel} ({q.status}) • ends {new Date(q.endsAt).toLocaleString()}
              </article>
            ))}
          </div>
        )}
      </DashboardPanel>
    </section>
  );
}
