type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel
}: EmptyStateProps) {
  return (
    <section className="card" style={{ padding: 24 }}>
      <span className="pill pill-info">Empty state</span>
      <h2 style={{ marginTop: 16, marginBottom: 8, fontSize: 18 }}>{title}</h2>
      <p className="muted" style={{ margin: 0 }}>
        {description}
      </p>
      {actionLabel ? (
        <div style={{ marginTop: 16 }}>
          <button className="button-secondary">{actionLabel}</button>
        </div>
      ) : null}
    </section>
  );
}

