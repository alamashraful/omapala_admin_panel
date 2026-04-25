type DetailPanelProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function DetailPanel({
  title,
  description,
  children
}: DetailPanelProps) {
  return (
    <aside className="card detail-panel">
      <h2 style={{ margin: 0, fontSize: 16, lineHeight: "24px" }}>{title}</h2>
      {description ? (
        <p className="section-subtitle" style={{ marginBottom: 16 }}>
          {description}
        </p>
      ) : null}
      {children}
    </aside>
  );
}

