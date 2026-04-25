type ErrorStateProps = {
  title: string;
  description: string;
  retryLabel?: string;
};

export function ErrorState({
  title,
  description,
  retryLabel = "Retry"
}: ErrorStateProps) {
  return (
    <section className="card" style={{ padding: 24 }}>
      <span className="pill pill-danger">Error state</span>
      <h2 style={{ marginTop: 16, marginBottom: 8, fontSize: 18 }}>{title}</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        {description}
      </p>
      <div style={{ marginTop: 16 }}>
        <button className="button-secondary">{retryLabel}</button>
      </div>
    </section>
  );
}

