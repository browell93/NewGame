import { redirect } from "next/navigation";
import { DashboardPanel } from "@/components/game/dashboard-panel";
import { MetricCard } from "@/components/game/metric-card";
import { getMissingSupabaseEnvNames } from "@/lib/env";
import { getBeginnerProtectionLabel, isBeginnerProtectionActive } from "@/lib/game/beginner-protection";
import { formatResourceAmount } from "@/lib/game/resource-math";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { collectResourcesAction } from "@/server/actions/resources";
import { ensureStarterCityForUser } from "@/server/services/bootstrap";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";
import { hostFestivalAction } from "@/server/actions/loyalty";
import { declareTaxReliefAction } from "@/server/actions/edicts";
import { getCityLoyaltyEvents } from "@/server/services/loyalty-events";
import { getCityEdicts } from "@/server/services/city-edicts";
import { imposeCurfewAction } from "@/server/actions/unrest";
import { getCityUnrestIncidents } from "@/server/services/unrest-incidents";
import { projectAccruedResources } from "@/server/services/resource-accrual";

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

export default async function GameDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : null;
  const errorMessage = typeof params.error === "string" ? params.error : null;

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
  if (!dashboard) throw new Error("Starter city bootstrap completed, but no dashboard city could be loaded.");

  const projectedResources = projectAccruedResources({
    snapshot: dashboard.resources,
    lastCollectedAt: dashboard.resourcesLastCollectedAt,
    taxRate: dashboard.population.taxRate,
  });

  const resources = Object.entries(resourceLabels).map(([key, label]) => ({
    key,
    label,
    value: projectedResources[key as keyof typeof projectedResources],
  }));
  const productionPerHour = {
    gold: Math.floor(36 * (1 + Math.max(0, dashboard.population.taxRate) / 100)),
    food: 140,
    lumber: 110,
    stone: 95,
    iron: 80,
  };


  const protectionIsActive = isBeginnerProtectionActive(dashboard.protection);
  const loyaltyEvents = await getCityLoyaltyEvents(supabase as never, dashboard.city.id);
  const edicts = await getCityEdicts(supabase as never, dashboard.city.id);
  const unrestIncidents = await getCityUnrestIncidents(supabase as never, dashboard.city.id);
  const protectionLabel = getBeginnerProtectionLabel(dashboard.protection);

  return (
    <section className="space-y-6">
      {message ? <p className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">{message}</p> : null}
      {errorMessage ? <p className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">{errorMessage}</p> : null}

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
            <div className={`rounded-2xl border px-4 py-3 text-sm ${protectionIsActive ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-white/10 bg-slate-950/60 text-slate-300"}`}>
              Beginner protection: <span className="font-semibold">{protectionLabel}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <form action={collectResourcesAction}>
            <button type="submit" className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">
              Collect now
            </button>
          </form>
        </div>
      </DashboardPanel>


      <DashboardPanel title="Resource cadence" eyebrow="Milestone 3">
        <p className="text-sm text-slate-300">Last collected: {new Date(dashboard.resourcesLastCollectedAt).toLocaleString()}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(resourceLabels).map(([key, label]) => (
            <p key={`rate-${key}`} className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">
              {label}: +{formatResourceAmount(productionPerHour[key as keyof typeof productionPerHour])}/hr
            </p>
          ))}
        </div>
      </DashboardPanel>


      <DashboardPanel title="Loyalty and unrest" eyebrow="Milestone 19">
        <p className="text-sm text-slate-300">Loyalty {dashboard.population.loyalty}% • Unrest {dashboard.population.unrest}%</p>
        <form action={hostFestivalAction} className="mt-3">
          <button type="submit" className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-100">Host festival (+loyalty)</button>
        </form>
        <div className="mt-3 space-y-2">
          {loyaltyEvents.slice(0, 3).map((event) => (
            <p key={event.id} className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-xs text-slate-300">
              {event.eventType}: loyalty {event.loyaltyDelta >= 0 ? "+" : ""}{event.loyaltyDelta}, unrest {event.unrestDelta >= 0 ? "+" : ""}{event.unrestDelta}
            </p>
          ))}
          {loyaltyEvents.length === 0 ? <p className="text-xs text-slate-400">No loyalty events yet.</p> : null}
        </div>
      </DashboardPanel>


      <DashboardPanel title="City edicts" eyebrow="Milestone 20">
        <p className="text-sm text-slate-300">Use policy decisions to stabilize your city while trading growth for taxes.</p>
        <form action={declareTaxReliefAction} className="mt-3">
          <button type="submit" className="rounded-xl border border-sky-300/30 bg-sky-300/10 px-3 py-2 text-sm font-semibold text-sky-100">Declare tax relief (-tax, +loyalty)</button>
        </form>
        <div className="mt-3 space-y-2">
          {edicts.slice(0, 3).map((edict) => (
            <p key={edict.id} className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-xs text-slate-300">
              {edict.edictKey}: tax {edict.taxRateDelta >= 0 ? "+" : ""}{edict.taxRateDelta}, loyalty {edict.loyaltyDelta >= 0 ? "+" : ""}{edict.loyaltyDelta}, unrest {edict.unrestDelta >= 0 ? "+" : ""}{edict.unrestDelta}
            </p>
          ))}
          {edicts.length === 0 ? <p className="text-xs text-slate-400">No edicts issued yet.</p> : null}
        </div>
      </DashboardPanel>

      <DashboardPanel title="Unrest controls" eyebrow="Milestone 21">
        <p className="text-sm text-slate-300">Emergency controls reduce unrest quickly but hurt loyalty.</p>
        <form action={imposeCurfewAction} className="mt-3">
          <button type="submit" className="rounded-xl border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-sm font-semibold text-rose-100">Impose curfew (-unrest, -loyalty)</button>
        </form>
        <div className="mt-3 space-y-2">
          {unrestIncidents.slice(0, 3).map((incident) => (
            <p key={incident.id} className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-xs text-slate-300">
              {incident.incidentKey}: tax {incident.taxRateDelta >= 0 ? "+" : ""}{incident.taxRateDelta}, loyalty {incident.loyaltyDelta >= 0 ? "+" : ""}{incident.loyaltyDelta}, unrest {incident.unrestDelta >= 0 ? "+" : ""}{incident.unrestDelta}
            </p>
          ))}
          {unrestIncidents.length === 0 ? <p className="text-xs text-slate-400">No unrest incidents yet.</p> : null}
        </div>
      </DashboardPanel>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {resources.map((resource) => (
          <MetricCard key={resource.key} label={resource.label} value={formatResourceAmount(resource.value)} detail="Projected with passive accrual" />
        ))}
      </div>
    </section>
  );
}
