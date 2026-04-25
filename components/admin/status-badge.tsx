type StatusBadgeProps = {
  tone: "success" | "warning" | "review" | "danger" | "info";
  children: React.ReactNode;
};

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

