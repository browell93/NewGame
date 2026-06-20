import { redirect } from "next/navigation";
import { DashboardPanel } from "@/components/game/dashboard-panel";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { queueFirstFieldUpgradeAction } from "@/server/actions/resource-fields";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";
import { getCityResourceFields } from "@/server/services/resource-fields";

export default async function ResourcesPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : null;
  const errorMessage = typeof params.error === "string" ? params.error : null;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in%20to%20open%20resources");

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) redirect("/game?error=City%20not%20found");

  const resourceFieldState = await getCityResourceFields(supabase as never, dashboard.city.id);

  return (
    <section className="space-y-6">
      {message ? <p className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">{message}</p> : null}
      {errorMessage ? <p className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">{errorMessage}</p> : null}

      <DashboardPanel title="Resource fields" eyebrow="Milestone 13">
        <p className="text-sm text-slate-300">Queue an upgrade for your first resource plot.</p>
        <form action={queueFirstFieldUpgradeAction} className="mt-4">
          <button type="submit" className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">Queue first field +1</button>
        </form>
      </DashboardPanel>

      <DashboardPanel title="Plots" eyebrow="Economy grid">
        <div className="space-y-2">
          {resourceFieldState.fields.map((field) => (
            <article key={field.id} className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">
              Plot {field.plotIndex}: {field.fieldKey} • Lv. {field.level}
            </article>
          ))}
        </div>
      </DashboardPanel>

      <DashboardPanel title="Upgrade queue" eyebrow="Queue state">
        {resourceFieldState.queues.length === 0 ? <p className="text-sm text-slate-300">No queued field upgrades.</p> : (
          <div className="space-y-2">{resourceFieldState.queues.map((q) => <article key={q.id} className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">Field {q.fieldId} → Lv. {q.targetLevel} ({q.status}) • ends {new Date(q.endsAt).toLocaleString()}</article>)}</div>
        )}
      </DashboardPanel>
    </section>
  );
}
