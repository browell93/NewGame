import Link from "next/link";
import { signOutAction } from "@/server/actions/auth";

const navItems = [
  "City",
  "Buildings",
  "Resources",
  "Research",
  "Heroes",
  "Troops",
  "Walls",
  "Map",
  "Reports",
  "Alliance",
  "Inventory",
];

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-10 lg:px-12">
      <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/" className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
              Kingdoms of Ash
            </Link>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white">Command dashboard</h1>
          </div>

          <form action={signOutAction}>
            <button
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-rose-300/40 hover:bg-rose-300/10 hover:text-rose-100"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>

        <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 text-sm">
          {navItems.map((item, index) => (
            <span
              key={item}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 ${
                index === 0
                  ? "border-amber-300/40 bg-amber-300/10 text-amber-100"
                  : "border-white/10 bg-slate-950/60 text-slate-400"
              }`}
            >
              {item}
            </span>
          ))}
        </nav>
      </header>

      <main className="flex-1 py-6">{children}</main>
    </div>
  );
}
