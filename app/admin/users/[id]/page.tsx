import {
  submitSuspendUserAction,
  submitUnsuspendUserAction,
  submitUserRolesAction,
  submitUserStatusAction,
  submitWarnUserAction
} from "@/app/admin/actions";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { FlashBanner } from "@/components/admin/flash-banner";
import { StatusBadge } from "@/components/admin/status-badge";
import { getUserDetail } from "@/lib/admin-users";

export default async function UserDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const user = await getUserDetail(id);

  if (!user) {
    return (
      <div style={{ display: "grid", gap: 24 }}>
        <AdminSectionHeader
          title={`User Detail: ${id}`}
          description="The requested user record could not be found in the current dataset."
        />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <AdminSectionHeader
        title={user.displayName}
        description="Review account identity, enforcement status, and admin actions from one detail view."
        actions={
          <>
            <button className="button-secondary">Change role</button>
            <button className="button-secondary">Issue warning</button>
            <button className="button-primary">
              {user.status === "Suspended" ? "Unsuspend user" : "Suspend user"}
            </button>
          </>
        }
      />
      {query.success ? <FlashBanner kind="success" message={query.success} /> : null}
      {query.error ? <FlashBanner kind="error" message={query.error} /> : null}

      <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(320px, 1fr)", gap: 16 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <article className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: 18, lineHeight: "26px" }}>{user.displayName}</h2>
                  <StatusBadge tone={user.statusTone}>{user.status}</StatusBadge>
                </div>
                <p className="section-subtitle" style={{ marginTop: 6 }}>
                  {user.id} | {user.handler}
                </p>
              </div>
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
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 20 }}>
              <div className="card" style={{ padding: 12 }}>
                <p className="field-label">Email</p>
                <strong style={{ fontSize: 13 }}>{user.email}</strong>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <p className="field-label">Phone</p>
                <strong style={{ fontSize: 13 }}>{user.phone}</strong>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <p className="field-label">Location</p>
                <strong style={{ fontSize: 13 }}>{user.location}</strong>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <p className="field-label">Gender</p>
                <strong style={{ fontSize: 13 }}>{user.gender}</strong>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <p className="field-label">Bio</p>
              <div className="card" style={{ padding: 14 }}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: "22px" }}>{user.bio}</p>
              </div>
            </div>
          </article>

          <article className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 14, fontSize: 16, lineHeight: "24px" }}>
              Moderation and enforcement history
            </h2>
            <div style={{ display: "grid", gap: 12 }}>
              {user.moderationHistory.map((entry) => (
                <div key={entry} className="card" style={{ padding: 14 }}>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: "22px" }}>{entry}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside style={{ display: "grid", gap: 16, alignSelf: "start" }}>
          <article className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 14, fontSize: 16, lineHeight: "24px" }}>
              Account controls
            </h2>
            <div style={{ display: "grid", gap: 16 }}>
              <form action={submitUserStatusAction} style={{ display: "grid", gap: 8 }}>
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="returnPath" value={`/admin/users/${user.id}`} />
                <p className="field-label">Account status</p>
                <select className="select-input" name="status" defaultValue={user.status === "Suspended" ? "SUSPENDED" : "ACTIVE"}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
                <input className="text-input" name="reason" placeholder="Optional reason" />
                <ConfirmSubmitButton
                  className="button-secondary"
                  confirmMessage="Apply this account status change?"
                  pendingText="Updating..."
                >
                  Update status
                </ConfirmSubmitButton>
              </form>

              <form action={submitUserRolesAction} style={{ display: "grid", gap: 8 }}>
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="returnPath" value={`/admin/users/${user.id}`} />
                <p className="field-label">Roles</p>
                <label><input type="checkbox" name="roles" value="USER" defaultChecked={user.roles.includes("USER")} /> USER</label>
                <label><input type="checkbox" name="roles" value="ADMIN" defaultChecked={user.roles.includes("ADMIN")} /> ADMIN</label>
                <label><input type="checkbox" name="roles" value="POST_MODERATOR" defaultChecked={user.roles.includes("POST_MODERATOR")} /> POST_MODERATOR</label>
                <ConfirmSubmitButton
                  className="button-secondary"
                  confirmMessage="Update this user's roles?"
                  pendingText="Updating..."
                >
                  Update roles
                </ConfirmSubmitButton>
              </form>

              <form action={submitWarnUserAction} style={{ display: "grid", gap: 8 }}>
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="returnPath" value={`/admin/users/${user.id}`} />
                <p className="field-label">Warnings</p>
                <input className="text-input" type="number" min="1" max="10" name="count" defaultValue="1" />
                <ConfirmSubmitButton
                  className="button-secondary"
                  confirmMessage="Issue the selected number of warnings to this user?"
                  pendingText="Warning..."
                >
                  Issue warning
                </ConfirmSubmitButton>
              </form>

              <form action={submitSuspendUserAction} style={{ display: "grid", gap: 8 }}>
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="returnPath" value={`/admin/users/${user.id}`} />
                <p className="field-label">Suspend user</p>
                <input className="text-input" name="reason" placeholder="Reason" />
                <input className="text-input" type="number" min="1" max="8760" name="hours" defaultValue="24" />
                <label><input type="checkbox" name="permanent" value="true" /> Permanent suspension</label>
                <ConfirmSubmitButton
                  className="button-primary"
                  confirmMessage="Suspend this account with the provided settings?"
                  pendingText="Suspending..."
                >
                  Suspend account
                </ConfirmSubmitButton>
              </form>

              <form action={submitUnsuspendUserAction}>
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="returnPath" value={`/admin/users/${user.id}`} />
                <ConfirmSubmitButton
                  className="button-secondary"
                  confirmMessage="Unsuspend this account?"
                  pendingText="Unsuspending..."
                >
                  Unsuspend account
                </ConfirmSubmitButton>
              </form>
            </div>
          </article>

          <article className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 14, fontSize: 16, lineHeight: "24px" }}>
              Compliance snapshot
            </h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div className="card" style={{ padding: 12 }}>
                <p className="field-label">Agreed to terms</p>
                <strong style={{ fontSize: 13 }}>
                  {user.agreedToTerms ? `Yes | ${user.agreedToTermsAt}` : "No"}
                </strong>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <p className="field-label">Password changed</p>
                <strong style={{ fontSize: 13 }}>{user.passwordChangedAt}</strong>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <p className="field-label">Suspension reason</p>
                <strong style={{ fontSize: 13 }}>{user.suspensionReason}</strong>
              </div>
            </div>
          </article>

          <article className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 14, fontSize: 16, lineHeight: "24px" }}>
              Admin action log
            </h2>
            <div style={{ display: "grid", gap: 10 }}>
              {user.enforcementLog.map((entry) => (
                <div key={`${entry.date}-${entry.action}`} className="card" style={{ padding: 12 }}>
                  <strong style={{ display: "block", fontSize: 13 }}>{entry.action}</strong>
                  <span className="muted" style={{ fontSize: 12 }}>
                    {entry.date} | {entry.actor}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}
