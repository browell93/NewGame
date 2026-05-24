import { redirect } from "next/navigation";
import { DashboardPanel } from "@/components/game/dashboard-panel";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveLatestMarchAction } from "@/server/actions/battles";
import { generateScoutReportAction, markAllReportsReadAction } from "@/server/actions/reports";
import { getPlayerBattleResolutions } from "@/server/services/battle-resolutions";
import { getPlayerReports } from "@/server/services/reports";

export default async function ReportsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : null;
  const errorMessage = typeof params.error === "string" ? params.error : null;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in%20to%20open%20reports");

  const reports = await getPlayerReports(supabase as never, user.id);
  const battleResolutions = await getPlayerBattleResolutions(supabase as never, user.id);
  const unreadCount = reports.filter((r) => !r.isRead).length;

  return (
    <section className="space-y-6">
      {message ? <p className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">{message}</p> : null}
      {errorMessage ? <p className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">{errorMessage}</p> : null}

      <DashboardPanel title="Battle and scout reports" eyebrow="Milestone 10">
        <p className="text-sm text-slate-300">Unread reports: {unreadCount}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <form action={generateScoutReportAction}>
            <button type="submit" className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">Generate scout report</button>
          </form>
          <form action={resolveLatestMarchAction}>
            <button type="submit" className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-100">Resolve latest march</button>
          </form>
          <form action={markAllReportsReadAction}>
            <button type="submit" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white">Mark all read</button>
          </form>
        </div>
      </DashboardPanel>

      <DashboardPanel title="Battle resolutions" eyebrow="Milestone 15">
        {battleResolutions.length === 0 ? (
          <p className="text-sm text-slate-300">No battle resolutions yet.</p>
        ) : (
          <div className="space-y-2">
            {battleResolutions.map((battle) => (
              <article key={battle.id} className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">
                March {battle.marchId} • {battle.outcome} • losses A:{battle.attackerLosses} / D:{battle.defenderLosses} • loot food {battle.lootFood}
              </article>
            ))}
          </div>
        )}
      </DashboardPanel>

      <DashboardPanel title="Recent reports" eyebrow="Inbox">
        {reports.length === 0 ? (
          <p className="text-sm text-slate-300">No reports yet.</p>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <article key={r.id} className={`rounded-xl border px-3 py-2 text-sm ${r.isRead ? "border-white/10 bg-slate-950/40 text-slate-300" : "border-amber-300/30 bg-amber-300/10 text-amber-100"}`}>
                <p className="font-semibold">{r.title} ({r.type})</p>
                <p className="mt-1">{r.body}</p>
                <p className="mt-1 text-xs opacity-80">{new Date(r.createdAt).toLocaleString()}</p>
              </article>
            ))}
          </div>
        )}
      </DashboardPanel>
    </section>
  );
}
