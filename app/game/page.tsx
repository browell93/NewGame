import { redirect } from "next/navigation";
import { DashboardPanel } from "@/components/game/dashboard-panel";
import { MetricCard } from "@/components/game/metric-card";
import { getMissingSupabaseEnvNames } from "@/lib/env";
import { getBeginnerProtectionLabel, isBeginnerProtectionActive } from "@/lib/game/beginner-protection";
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
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">Supabase setup required</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Add your Supabase environment variables in Vercel.</h2>
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

  const protectionIsActive = isBeginnerProtectionActive(dashboard.protection);
  const protectionLabel = getBeginnerProtectionLabel(dashboard.protection);

  return (
    <section className="space-y-6">
      <DashboardPanel>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">Capital city</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-white">{dashboard.city.name}</h2>
          </div>
          <div className="space-y-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
              Region: <span className="font-semibold text-white">{dashboard.city.regionKey}</span>
            </div>
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                protectionIsActive
                  ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                  : "border-white/10 bg-slate-950/60 text-slate-300"
              }`}
            >
              Beginner protection: <span className="font-semibold">{protectionLabel}</span>
            </div>
          </div>
        </div>
      </DashboardPanel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {resources.map((resource) => (
          <MetricCard key={resource.key} label={resource.label} value={formatResourceAmount(resource.value)} detail="Starter stockpile" />
        ))}
      </div>
    </section>
  );
}
