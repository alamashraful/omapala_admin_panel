import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { submitAdminLogin } from "@/app/auth-actions";
import { hasAdminAccessFromToken } from "@/lib/auth";

export default async function HomePage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; success?: string; redirectTo?: string; reason?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const cookieStore = await cookies();
  const token = cookieStore.get("omapala_access_token")?.value;
  const redirectTo =
    params.redirectTo && params.redirectTo.startsWith("/") ? params.redirectTo : "/admin";

  if (token && hasAdminAccessFromToken(token)) {
    redirect("/admin");
  }

  const message =
    params.error ??
    (params.reason === "admin_access_required"
      ? "Admin access is required to continue."
      : undefined);

  return (
    <main className="login-shell">
      <section className="login-panel card">
        <div style={{ display: "grid", gap: 14 }}>
          <p className="pill pill-info" style={{ margin: 0, width: "fit-content" }}>
            Omapala Admin
          </p>
          <div>
            <h1 className="login-title">Admin sign in</h1>
            <p className="section-subtitle" style={{ marginTop: 10 }}>
              Use an administrator account to access moderation, reports, users, policies, and platform controls.
            </p>
          </div>
        </div>

        {params.success ? (
          <div className="card" style={{ padding: 12, background: "var(--success-soft)", borderColor: "rgba(24,121,78,0.18)" }}>
            <strong style={{ color: "var(--success)", fontSize: 13 }}>{params.success}</strong>
          </div>
        ) : null}

        {message ? (
          <div className="card" style={{ padding: 12, background: "var(--danger-soft)", borderColor: "rgba(186,26,26,0.16)" }}>
            <strong style={{ color: "var(--danger)", fontSize: 13 }}>{message}</strong>
          </div>
        ) : null}

        <form action={submitAdminLogin} style={{ display: "grid", gap: 16 }}>
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div style={{ display: "grid", gap: 6 }}>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="text-input"
              type="email"
              name="email"
              placeholder="admin@omapala.com"
              autoComplete="email"
              required
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="text-input"
              type="password"
              name="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button className="button-primary" type="submit" style={{ minHeight: 42 }}>
            Sign in
          </button>
        </form>

        <div className="card" style={{ padding: 14, background: "var(--surface-subtle)" }}>
          <p className="field-label">Access note</p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: "22px" }}>
            Only accounts with the <span className="mono">ADMIN</span> role can enter the admin console.
          </p>
        </div>
      </section>
    </main>
  );
}
