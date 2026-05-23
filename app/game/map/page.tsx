import { redirect } from "next/navigation";
import { DashboardPanel } from "@/components/game/dashboard-panel";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { scoutNextRegionAction } from "@/server/actions/map";
import { getPlayerMapRegions } from "@/server/services/map-regions";

export default async function MapPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : null;
  const errorMessage = typeof params.error === "string" ? params.error : null;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in%20to%20open%20map");

  const regions = await getPlayerMapRegions(supabase as never, user.id);

  return (
    <section className="space-y-6">
      {message ? <p className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">{message}</p> : null}
      {errorMessage ? <p className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">{errorMessage}</p> : null}

      <DashboardPanel title="World map" eyebrow="Milestone 9">
        <p className="text-sm text-slate-300">Scout nearby regions to expand world visibility.</p>
        <form action={scoutNextRegionAction} className="mt-4">
          <button type="submit" className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">Scout next region</button>
        </form>
      </DashboardPanel>

      <DashboardPanel title="Known regions" eyebrow="Exploration">
        <div className="space-y-2">
          {regions.map((region) => (
            <article key={region.key} className={`rounded-xl border px-3 py-2 text-sm ${region.discovered ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-white/10 bg-slate-950/50 text-slate-300"}`}>
              {region.name} ({region.key}) • Threat {region.threatLevel} • ({region.x}, {region.y}) • {region.discovered ? "Discovered" : "Undiscovered"}
            </article>
          ))}
        </div>
      </DashboardPanel>
    </section>
  );
}
