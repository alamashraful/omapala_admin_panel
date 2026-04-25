type LoadingSkeletonProps = {
  title: string;
  description?: string;
};

export function LoadingSkeleton({
  title,
  description
}: LoadingSkeletonProps) {
  return (
    <section className="card" style={{ padding: 24 }}>
      <span className="pill pill-warning">Loading state</span>
      <h2 style={{ marginTop: 16, marginBottom: 8, fontSize: 18 }}>{title}</h2>
      {description ? (
        <p className="muted" style={{ marginTop: 0 }}>
          {description}
        </p>
      ) : null}
      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        <div
          style={{
            height: 12,
            width: "42%",
            borderRadius: 999,
            background: "#e8eef7"
          }}
        />
        <div
          style={{
            height: 12,
            width: "86%",
            borderRadius: 999,
            background: "#e8eef7"
          }}
        />
        <div
          style={{
            height: 140,
            borderRadius: 12,
            background: "#eff4ff"
          }}
        />
      </div>
    </section>
  );
}

