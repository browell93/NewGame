import { redirect } from "next/navigation";
import { DashboardPanel } from "@/components/game/dashboard-panel";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { claimSupplyCrateAction } from "@/server/actions/inventory";
import { getPrimaryCityDashboard } from "@/server/services/city-dashboard";
import { getCityInventory } from "@/server/services/inventory";

export default async function InventoryPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : null;
  const errorMessage = typeof params.error === "string" ? params.error : null;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in%20to%20open%20inventory");

  const dashboard = await getPrimaryCityDashboard(supabase, user.id);
  if (!dashboard) redirect("/game?error=City%20not%20found");

  const inventory = await getCityInventory(supabase as never, dashboard.city.id);

  return (
    <section className="space-y-6">
      {message ? <p className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">{message}</p> : null}
      {errorMessage ? <p className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">{errorMessage}</p> : null}

      <DashboardPanel title="City inventory" eyebrow="Milestone 12">
        <p className="text-sm text-slate-300">Claim utility items and review your city stockpile.</p>
        <form action={claimSupplyCrateAction} className="mt-4">
          <button type="submit" className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">Claim supply crate</button>
        </form>
      </DashboardPanel>

      <DashboardPanel title="Items" eyebrow="Storage">
        {inventory.length === 0 ? (
          <p className="text-sm text-slate-300">No items in storage.</p>
        ) : (
          <div className="space-y-2">
            {inventory.map((item) => (
              <article key={item.id} className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">
                {item.itemName} ({item.itemKey}) • Qty {item.quantity} • {item.rarity}
              </article>
            ))}
          </div>
        )}
      </DashboardPanel>
    </section>
  );
}
