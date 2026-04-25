type AdminSectionHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function AdminSectionHeader({
  title,
  description,
  actions
}: AdminSectionHeaderProps) {
  return (
    <section
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "end",
        gap: 16,
        flexWrap: "wrap"
      }}
    >
      <div>
        <h1 className="section-title">{title}</h1>
        {description ? <p className="section-subtitle">{description}</p> : null}
      </div>
      {actions ? <div style={{ display: "flex", gap: 12 }}>{actions}</div> : null}
    </section>
  );
}

