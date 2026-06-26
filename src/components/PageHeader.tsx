interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional element accent for the glow; defaults to gold. */
  accent?: string;
}

export function PageHeader({ title, subtitle, accent }: PageHeaderProps) {
  const color = accent ?? "var(--color-accent)";
  return (
    <header className="mb-7">
      <div className="flex items-center gap-3">
        <span
          className="h-8 w-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 12px ${color}` }}
        />
        <h1 className="display text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      {subtitle && (
        <p className="mt-2 pl-[18px] text-sm text-[var(--color-fg-muted)]">
          {subtitle}
        </p>
      )}
    </header>
  );
}
