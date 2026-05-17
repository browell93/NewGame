import Link from "next/link";

const highlights = [
  "Persistent city progression",
  "Server-authoritative player bootstrapping",
  "Starter economy and building snapshot",
  "Ready for queues, research, heroes, and combat milestones",
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
      <nav className="flex items-center justify-between border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
            Kingdoms of Ash
          </p>
          <p className="mt-1 text-sm text-slate-400">Milestone 1 foundation</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link
            className="rounded-full border border-white/10 px-4 py-2 text-slate-200 transition hover:border-amber-300/60 hover:text-white"
            href="/auth/sign-in"
          >
            Sign in
          </Link>
          <Link
            className="rounded-full bg-amber-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-200"
            href="/auth/sign-up"
          >
            Create account
          </Link>
        </div>
      </nav>

      <section className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-200">
            Browser-first medieval strategy scaffold
          </p>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl">
            Build the first playable backbone of a persistent multiplayer war kingdom.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            This milestone establishes authentication, protected game access, a transactional first-login
            city bootstrap, core database tables, seed data, and a city dashboard designed for the later
            economy, hero, troop, and combat systems.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="rounded-2xl bg-amber-300 px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-amber-200"
              href="/auth/sign-up"
            >
              Start your realm
            </Link>
            <Link
              className="rounded-2xl border border-white/10 px-5 py-3 text-center font-semibold text-slate-100 transition hover:border-white/30 hover:bg-white/5"
              href="/game"
            >
              Open game shell
            </Link>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Milestone 1 includes
            </p>
            <div className="mt-5 space-y-4">
              {highlights.map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <p className="text-sm leading-6 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
