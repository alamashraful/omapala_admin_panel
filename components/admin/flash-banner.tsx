type FlashBannerProps = {
  kind: "success" | "error";
  message: string;
};

export function FlashBanner({ kind, message }: FlashBannerProps) {
  return (
    <div
      className="card"
      style={{
        padding: 14,
        borderColor: kind === "error" ? "rgba(186,26,26,0.25)" : "rgba(24,121,78,0.25)",
        background: kind === "error" ? "var(--danger-soft)" : "var(--success-soft)"
      }}
    >
      <strong
        style={{
          display: "block",
          fontSize: 13,
          color: kind === "error" ? "var(--danger)" : "var(--success)"
        }}
      >
        {kind === "error" ? "Action failed" : "Action completed"}
      </strong>
      <span style={{ fontSize: 13 }}>{message}</span>
    </div>
  );
}
