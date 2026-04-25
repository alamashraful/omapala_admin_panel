import Link from "next/link";

import {
  submitSuspendUserAction,
  submitUnsuspendUserAction,
  submitWarnUserAction
} from "@/app/admin/actions";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/admin/empty-state";
import { FilterBar } from "@/components/admin/filter-bar";
import { FlashBanner } from "@/components/admin/flash-banner";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { getUserSummary, getUsers } from "@/lib/admin-users";

export default async function UsersPage({
  searchParams
}: {
  searchParams?: Promise<{
    status?: string;
    role?: string;
    q?: string;
    success?: string;
    error?: string;
  }>;
}) {
  const params = (await searchParams) ?? {};
  const users = await getUsers({
    status: params.status,
    role: params.role,
    q: params.q
  });
  const summary = await getUserSummary();

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <AdminSectionHeader
        title="Users"
        description="Inspect account status, role assignments, warnings, and enforcement posture."
        actions={
          <>
            <button className="button-primary">Invite user</button>
            <button className="button-secondary">Export CSV</button>
          </>
        }
      />

      {params.success ? <FlashBanner kind="success" message={params.success} /> : null}
      {params.error ? <FlashBanner kind="error" message={params.error} /> : null}

      <section className="kpi-grid">
        <article className="card kpi-card">
          <div className="pill pill-info">Total users</div>
          <p className="metric">{summary.totalUsers}</p>
          <p className="muted" style={{ marginBottom: 0 }}>+12% vs last month</p>
        </article>
        <article className="card kpi-card">
          <div className="pill pill-danger">Suspended</div>
          <p className="metric">{summary.suspendedUsers}</p>
          <p className="muted" style={{ marginBottom: 0 }}>8 pending review today</p>
        </article>
        <article className="card kpi-card">
          <div className="pill pill-review">Moderators</div>
          <p className="metric">{summary.moderators}</p>
          <p className="muted" style={{ marginBottom: 0 }}>Active across 12 zones</p>
        </article>
        <article className="card kpi-card">
          <div className="pill pill-success">New today</div>
          <p className="metric">{summary.newToday}</p>
          <p className="muted" style={{ marginBottom: 0 }}>94% verified rate</p>
        </article>
      </section>

      <FilterBar
        fields={[
          { id: "role", label: "Role", type: "select", options: ["All", "ADMIN", "POST_MODERATOR", "USER"] },
          { id: "status", label: "Status", type: "select", options: ["All", "Active", "Warned", "Suspended"] },
          { id: "created", label: "Created after", type: "input", inputType: "date" },
          { id: "search", label: "Search", type: "input", inputType: "text" }
        ]}
      />

      <section className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: 16, borderBottom: "1px solid #edf1f6", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, lineHeight: "24px" }}>User directory</h2>
            <p className="section-subtitle" style={{ marginTop: 4 }}>
              Search by email, phone, name, or handler. Detail pages include deeper account controls.
            </p>
          </div>
          <span className="muted" style={{ fontSize: 13 }}>Showing 1-{users.length} of 24,512 users</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Profile</th>
                <th>Handler</th>
                <th>Status</th>
                <th>Roles</th>
                <th>Verified</th>
                <th>Warnings</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="mono">{user.id}</td>
                  <td>
                    <div style={{ display: "grid", gap: 2 }}>
                      <strong style={{ fontSize: 13 }}>{user.displayName}</strong>
                      <span className="muted" style={{ fontSize: 11 }}>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: "var(--primary-strong)", fontWeight: 600 }}>{user.handler}</span>
                  </td>
                  <td><StatusBadge tone={user.statusTone}>{user.status}</StatusBadge></td>
                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {user.roles.map((role) => (
                        <StatusBadge
                          key={role}
                          tone={role === "ADMIN" ? "review" : role === "POST_MODERATOR" ? "info" : "warning"}
                        >
                          {role}
                        </StatusBadge>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "grid", gap: 4 }}>
                      <span className="muted" style={{ fontSize: 12 }}>Email: {user.emailVerified ? "Yes" : "No"}</span>
                      <span className="muted" style={{ fontSize: 12 }}>Phone: {user.phoneVerified ? "Yes" : "No"}</span>
                    </div>
                  </td>
                  <td>
                    <strong
                      style={{
                        color:
                          user.warningCount >= 5
                            ? "var(--danger)"
                            : user.warningCount >= 2
                              ? "var(--warning)"
                              : "inherit"
                      }}
                    >
                      {user.warningCount}
                    </strong>
                  </td>
                  <td>
                    <div style={{ display: "grid", gap: 2 }}>
                      <span>{user.createdAt}</span>
                      <span className="muted" style={{ fontSize: 11 }}>Updated {user.updatedAt}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Link className="button-secondary" href={`/admin/users/${user.id}`}>View</Link>
                      <form action={submitWarnUserAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="count" value="1" />
                        <input type="hidden" name="returnPath" value="/admin/users" />
                        <ConfirmSubmitButton
                          className="button-secondary"
                          confirmMessage="Issue one warning to this user from the table view?"
                          pendingText="Warning..."
                        >
                          Warn
                        </ConfirmSubmitButton>
                      </form>
                      {user.status === "Suspended" ? (
                        <form action={submitUnsuspendUserAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="returnPath" value="/admin/users" />
                          <ConfirmSubmitButton
                            className="button-secondary"
                            confirmMessage="Unsuspend this user from the table view?"
                            pendingText="Unsuspending..."
                          >
                            Unsuspend
                          </ConfirmSubmitButton>
                        </form>
                      ) : (
                        <form action={submitSuspendUserAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="reason" value="Quick suspension from users table" />
                          <input type="hidden" name="hours" value="24" />
                          <input type="hidden" name="returnPath" value="/admin/users" />
                          <ConfirmSubmitButton
                            className="button-secondary"
                            confirmMessage="Suspend this user for 24 hours from the users table?"
                            pendingText="Suspending..."
                          >
                            Suspend
                          </ConfirmSubmitButton>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: 16, borderTop: "1px solid #edf1f6", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <span className="muted" style={{ fontSize: 13 }}>Rows per page: 10</span>
            <span className="muted" style={{ fontSize: 12 }}>Suspended users show current enforcement state in the detail view.</span>
          </div>
          <Pagination page={1} totalPages={245} />
        </div>
      </section>

      {users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="The current filters returned no users from the live API. Try clearing filters or searching with a different term."
        />
      ) : null}
    </div>
  );
}
