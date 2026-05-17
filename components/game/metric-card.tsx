type MetricCardProps = {
  compact?: boolean;
  detail?: string;
  label: string;
  value: string;
};

export function MetricCard({ compact = false, detail, label, value }: MetricCardProps) {
  return (
    <article className={`rounded-2xl border border-white/10 bg-slate-950/60 ${compact ? "p-4" : "p-5"}`}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`${compact ? "mt-2 text-2xl" : "mt-3 text-3xl"} font-black tracking-tight text-white`}>
        {value}
      </p>
      {detail ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-amber-200/80">{detail}</p> : null}
    </article>
  );
}
