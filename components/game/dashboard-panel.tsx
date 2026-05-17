type DashboardPanelProps = {
  children: React.ReactNode;
  eyebrow?: string;
  title?: string;
};

export function DashboardPanel({ children, eyebrow, title }: DashboardPanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
      {eyebrow || title ? (
        <header className="mb-5">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">{eyebrow}</p>
          ) : null}
          {title ? <h3 className="mt-2 text-xl font-bold text-white">{title}</h3> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
