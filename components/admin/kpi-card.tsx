type KpiCardProps = {
  label: string;
  value: string;
  badge?: string;
  tone?: "success" | "warning" | "review" | "danger" | "info";
  helper?: string;
};

export function KpiCard({
  label,
  value,
  badge,
  tone = "info",
  helper
}: KpiCardProps) {
  return (
    <article className="card kpi-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div className={`pill pill-${tone}`}>{label}</div>
        {badge ? <div className={`pill pill-${tone}`}>{badge}</div> : null}
      </div>
      <p className="metric">{value}</p>
      {helper ? (
        <p className="muted" style={{ marginBottom: 0 }}>
          {helper}
        </p>
      ) : null}
    </article>
  );
}

