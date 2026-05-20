type SupabaseConfigAlertProps = {
  missingEnvNames: readonly string[];
};

export function SupabaseConfigAlert({ missingEnvNames }: SupabaseConfigAlertProps) {
  if (missingEnvNames.length === 0) {
    return null;
  }

  return (
    <div className="mb-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-4 text-sm text-amber-50">
      <p className="font-semibold text-amber-100">Supabase is almost connected.</p>
      <p className="mt-2 leading-6 text-slate-200">
        Add the missing variables in Vercel, enable them for Production, then redeploy before using auth.
      </p>
      <ul className="mt-3 space-y-2">
        {missingEnvNames.map((name) => (
          <li
            className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 font-mono text-xs text-amber-100 break-all"
            key={name}
          >
            {name}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-5 text-slate-300">
        Vercel path: Project → Settings → Environment Variables → Production → Redeploy.
      </p>
    </div>
  );
}
