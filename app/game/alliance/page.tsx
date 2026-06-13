import { redirect } from "next/navigation";
import { DashboardPanel } from "@/components/game/dashboard-panel";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAllianceAction, postAllianceMessageAction } from "@/server/actions/alliance";
import { logAllianceDrillAction } from "@/server/actions/alliance-events";
import { getAllianceEvents } from "@/server/services/alliance-events";
import { getAllianceMessages, getPlayerAlliance } from "@/server/services/alliance";

export default async function AlliancePage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : null;
  const errorMessage = typeof params.error === "string" ? params.error : null;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in?error=Please%20sign%20in%20to%20open%20alliance");

  const alliance = await getPlayerAlliance(supabase as never, user.id);
  const messages = alliance ? await getAllianceMessages(supabase as never, alliance.allianceId) : [];
  const events = alliance ? await getAllianceEvents(supabase as never, alliance.allianceId) : [];

  return (
    <section className="space-y-6">
      {message ? <p className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">{message}</p> : null}
      {errorMessage ? <p className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">{errorMessage}</p> : null}

      {!alliance ? (
        <DashboardPanel title="Create alliance" eyebrow="Milestone 11">
          <p className="text-sm text-slate-300">Found a new alliance and become its leader.</p>
          <form action={createAllianceAction} className="mt-4 grid gap-3 sm:max-w-md">
            <input name="name" placeholder="Alliance name" className="rounded-xl border border-white/20 bg-slate-950/60 px-3 py-2 text-sm text-white" />
            <input name="tag" placeholder="TAG" maxLength={8} className="rounded-xl border border-white/20 bg-slate-950/60 px-3 py-2 text-sm text-white" />
            <button type="submit" className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">Create alliance</button>
          </form>
        </DashboardPanel>
      ) : (
        <>
          <DashboardPanel title="Alliance overview" eyebrow="Milestone 11">
            <p className="text-sm text-slate-200">[{alliance.tag}] {alliance.name}</p>
            <p className="text-sm text-slate-400">Your role: {alliance.role}</p>
            <form action={logAllianceDrillAction} className="mt-3">
              <button type="submit" className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-100">Log alliance drill</button>
            </form>
          </DashboardPanel>

          <DashboardPanel title="Alliance events" eyebrow="Milestone 16">
            {events.length === 0 ? (
              <p className="text-sm text-slate-300">No alliance events yet.</p>
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <article key={event.id} className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
                    {event.eventType} • actor {event.actorPlayerId} • {new Date(event.createdAt).toLocaleString()}
                  </article>
                ))}
              </div>
            )}
          </DashboardPanel>

          <DashboardPanel title="Alliance chat" eyebrow="Coordination">
            <form action={postAllianceMessageAction} className="mb-4 flex gap-3">
              <input name="body" placeholder="Share an update..." className="flex-1 rounded-xl border border-white/20 bg-slate-950/60 px-3 py-2 text-sm text-white" />
              <button type="submit" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white">Send</button>
            </form>

            {messages.length === 0 ? (
              <p className="text-sm text-slate-300">No alliance messages yet.</p>
            ) : (
              <div className="space-y-2">
                {messages.map((m) => (
                  <article key={m.id} className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">
                    <p>{m.body}</p>
                    <p className="mt-1 text-xs opacity-80">{new Date(m.createdAt).toLocaleString()}</p>
                  </article>
                ))}
              </div>
            )}
          </DashboardPanel>
        </>
      )}
    </section>
  );
}
