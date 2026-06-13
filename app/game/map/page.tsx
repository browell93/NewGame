import { redirect } from "next/navigation";
import { DashboardPanel } from "@/components/game/dashboard-panel";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { dispatchScoutMarchAction } from "@/server/actions/marches";
import { planBorderPatrolOrderAction } from "@/server/actions/war-orders";
import { scoutNextRegionAction } from "@/server/actions/map";
import { getPlayerMapRegions } from "@/server/services/map-regions";
import { getPlayerMarches } from "@/server/services/marches";
import { getPlayerWarOrders } from "@/server/services/war-orders";

export default async function MapPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : null;
  const errorMessage = typeof params.error === "string" ? params.error : null;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in%20to%20open%20map");

  const regions = await getPlayerMapRegions(supabase as never, user.id);
  const marches = await getPlayerMarches(supabase as never, user.id);
  const warOrders = await getPlayerWarOrders(supabase as never, user.id);

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

      <DashboardPanel title="March command" eyebrow="Milestone 14">
        <p className="text-sm text-slate-300">Dispatch a scout march to a discovered or frontier-adjacent region.</p>
        <form action={dispatchScoutMarchAction} className="mt-4 grid gap-3 sm:max-w-md">
          <input name="destinationRegionKey" placeholder="frontier-02" className="rounded-xl border border-white/20 bg-slate-950/60 px-3 py-2 text-sm text-white" />
          <input name="troopQuantity" type="number" min={1} defaultValue={10} className="rounded-xl border border-white/20 bg-slate-950/60 px-3 py-2 text-sm text-white" />
          <button type="submit" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white">Dispatch scout march</button>
        </form>
      </DashboardPanel>


      <DashboardPanel title="War council orders" eyebrow="Milestone 26">
        <p className="text-sm text-slate-300">Plan lightweight war orders before turning them into marches or battle resolutions.</p>
        <form action={planBorderPatrolOrderAction} className="mt-4 grid gap-3 sm:max-w-md">
          <input name="targetRegionKey" placeholder="frontier-02" className="rounded-xl border border-white/20 bg-slate-950/60 px-3 py-2 text-sm text-white" />
          <input name="troopQuantity" type="number" min={1} defaultValue={15} className="rounded-xl border border-white/20 bg-slate-950/60 px-3 py-2 text-sm text-white" />
          <button type="submit" className="rounded-xl border border-red-300/30 bg-red-300/10 px-3 py-2 text-sm font-semibold text-red-100">Plan border patrol</button>
        </form>
        <div className="mt-4 space-y-2">
          {warOrders.length === 0 ? (
            <p className="text-sm text-slate-300">No war orders planned.</p>
          ) : (
            warOrders.map((order) => (
              <article key={order.id} className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">
                {order.orderKey} → {order.targetRegionKey} • {order.troopType} x{order.troopQuantity} • {order.status}
              </article>
            ))
          )}
        </div>
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

      <DashboardPanel title="Active marches" eyebrow="Operations">
        {marches.length === 0 ? (
          <p className="text-sm text-slate-300">No active marches.</p>
        ) : (
          <div className="space-y-2">
            {marches.map((march) => (
              <article key={march.id} className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">
                {march.troopType} x{march.troopQuantity} → {march.destinationRegionKey} ({march.status}) • arrives {new Date(march.arrivesAt).toLocaleString()}
              </article>
            ))}
          </div>
        )}
      </DashboardPanel>
    </section>
  );
}
