import { submitAdminLogout } from "@/app/auth-actions";

export function AdminTopbar() {
  return (
    <header className="admin-topbar">
      <label className="search-bar" aria-label="Admin search">
        <span aria-hidden="true">Search</span>
        <input placeholder="Search users, reports, or policies..." />
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button className="icon-button" aria-label="Notifications">
          Bell
        </button>
        <button className="icon-button" aria-label="Help">
          Help
        </button>
        <div
          style={{
            width: 1,
            height: 28,
            background: "var(--border)"
          }}
        />
        <div style={{ display: "grid", gap: 2 }}>
          <strong style={{ fontSize: 13 }}>Admin Profile</strong>
          <span style={{ fontSize: 11, color: "#5f6d7f", textTransform: "uppercase" }}>
            Super Administrator
          </span>
        </div>
        <form action={submitAdminLogout}>
          <button className="button-secondary" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
