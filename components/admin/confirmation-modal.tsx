type ConfirmationModalProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function ConfirmationModal({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel"
}: ConfirmationModalProps) {
  return (
    <div
      className="card"
      style={{
        padding: 24,
        maxWidth: 480
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
    >
      <span className="pill pill-danger">Confirmation</span>
      <h2 id="confirmation-title" style={{ marginTop: 16, marginBottom: 8 }}>
        {title}
      </h2>
      <p className="muted" style={{ marginTop: 0 }}>
        {description}
      </p>
      <div style={{ display: "flex", justifyContent: "end", gap: 12, marginTop: 20 }}>
        <button className="button-secondary">{cancelLabel}</button>
        <button className="button-primary">{confirmLabel}</button>
      </div>
    </div>
  );
}

