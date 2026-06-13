import Link from "next/link";
import { SupabaseConfigAlert } from "@/components/auth/supabase-config-alert";
import { getMissingSupabaseEnvNames } from "@/lib/env";
import { signUpAction } from "@/server/actions/auth";

type SignUpPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const missingEnvNames = getMissingSupabaseEnvNames();
  const isSupabaseMissing = missingEnvNames.length > 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
      <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/40 lg:grid-cols-2">
        <div className="hidden border-r border-white/10 bg-slate-950/60 p-10 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
            Kingdoms of Ash
          </p>
          <h1 className="mt-8 text-4xl font-black tracking-tight text-white">
            Found your frontier capital.
          </h1>
          <p className="mt-5 max-w-md leading-7 text-slate-300">
            This account flow is deliberately simple for Milestone 1. The first protected game visit runs the
            idempotent database bootstrap that provisions your player state.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-medium text-amber-200">Create account</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Begin your realm</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Email confirmation behavior follows your Supabase auth project settings.
            </p>
          </div>

          <SupabaseConfigAlert missingEnvNames={missingEnvNames} />

          {!isSupabaseMissing && params?.error ? (
            <div className="mb-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {params.error}
            </div>
          ) : null}

          <form action={signUpAction} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Display name</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/70"
                disabled={isSupabaseMissing}
                maxLength={32}
                name="displayName"
                placeholder="Ashwarden"
                required
                type="text"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
              <input
                autoComplete="email"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/70"
                disabled={isSupabaseMissing}
                name="email"
                placeholder="ruler@example.com"
                required
                type="email"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
              <input
                autoComplete="new-password"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/70"
                disabled={isSupabaseMissing}
                minLength={8}
                name="password"
                placeholder="At least 8 characters"
                required
                type="password"
              />
            </label>

            <button
              className="w-full rounded-2xl bg-amber-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
              disabled={isSupabaseMissing}
              type="submit"
            >
              {isSupabaseMissing ? "Finish Vercel setup first" : "Create ruler account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Already registered?{" "}
            <Link className="font-semibold text-amber-200 hover:text-amber-100" href="/auth/sign-in">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
