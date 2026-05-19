import { redirect } from "next/navigation";
import { DashboardPanel } from "@/components/game/dashboard-panel";
import { MetricCard } from "@/components/game/metric-card";
import { getMissingSupabaseEnvNames } from "@/lib/env";
import { formatResourceAmount } from "@/lib/game/resource-math";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureStarterCityForUser } from "@/server/services/bootstrap";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";

const resourceLabels = {
  gold: "Gold",
  food: "Food",
  lumber: "Lumber",
  stone: "Stone",
  iron: "Iron",
} as const;

function SupabaseSetupNotice({ missingEnvNames }: { missingEnvNames: string[] }) {
  return (
    <section className="rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-6 shadow-2xl shadow-black/20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">
        Supabase setup required
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
        Add your Supabase environment variables in Vercel.
      </h2>
      <p className="mt-4 max-w-3xl leading-7 text-slate-200">
        The public landing page can load without Supabase, but the game dashboard needs these values before
        authentication and city data can work. Add them in Vercel Project Settings, then redeploy production.
      </p>
      <ul className="mt-5 space-y-2 text-sm text-slate-100">
        {missingEnvNames.map((name) => (
          <li key={name} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono">
            {name}
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm leading-6 text-slate-300">
        Vercel path: Project → Settings → Environment Variables. Make sure the variables are enabled for
        Production, then redeploy the latest deployment so the runtime receives them.
      </p>
    </section>
  );
}

export default async function GameDashboardPage() {
  const missingEnvNames = getMissingSupabaseEnvNames();

  if (missingEnvNames.length > 0) {
    return <SupabaseSetupNotice missingEnvNames={missingEnvNames} />;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?error=Please%20sign%20in%20to%20open%20the%20game.");
  }

  await ensureStarterCityForUser(supabase, user);
  const dashboard = await getPrimaryCityDashboard(supabase, user.id);

  if (!dashboard) {
    throw new Error("Starter city bootstrap completed, but no dashboard city could be loaded.");
  }

  const resources = Object.entries(resourceLabels).map(([key, label]) => ({
    key,
    label,
    value: dashboard.resources[key as keyof typeof dashboard.resources],
  }));

  return (
    <section className="space-y-6">
      <DashboardPanel>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">
              Capital city
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-white">{dashboard.city.name}</h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-300">
              Your realm has been provisioned with a first-city profile, a starter economy, and the initial
              urban structures required for future milestones.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
            Region: <span className="font-semibold text-white">{dashboard.city.regionKey}</span>
          </div>
        </div>
      </DashboardPanel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {resources.map((resource) => (
          <MetricCard
            key={resource.key}
            label={resource.label}
            value={formatResourceAmount(resource.value)}
            detail="Starter stockpile"
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <DashboardPanel title="Population snapshot" eyebrow="City state">
          <dl className="grid gap-4 sm:grid-cols-2">
            <MetricCard label="Maximum" value={dashboard.population.maxPopulation.toLocaleString()} detail="Housing cap" compact />
            <MetricCard label="Current" value={dashboard.population.currentPopulation.toLocaleString()} detail="Residents" compact />
            <MetricCard label="Idle" value={dashboard.population.idlePopulation.toLocaleString()} detail="Ready labor" compact />
            <MetricCard label="Tax rate" value={`${dashboard.population.taxRate}%`} detail={`Loyalty ${dashboard.population.loyalty}%`} compact />
          </dl>
        </DashboardPanel>

        <DashboardPanel title="Starting buildings" eyebrow="Urban core">
          <div className="grid gap-3 sm:grid-cols-2">
            {dashboard.buildings.map((building) => (
              <article
                key={building.key}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{building.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{building.category}</p>
                  </div>
                  <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100">
                    Lv. {building.level}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </DashboardPanel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Queues", "Construction, research, and training queues land in Milestones 3–5."],
          ["Heroes", "Inn recruitment and city assignments arrive in Milestone 6."],
          ["Research", "Academy technologies and modifiers arrive in Milestone 5."],
          ["Troops", "Barracks production and city troop stacks arrive in Milestone 7."],
        ].map(([title, detail]) => (
          <DashboardPanel key={title} title={title} eyebrow="Placeholder">
            <p className="text-sm leading-6 text-slate-300">{detail}</p>
          </DashboardPanel>
        ))}
      </div>
    </section>
  );
}
