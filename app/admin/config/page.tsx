import { submitConfigUpdate } from "@/app/admin/actions";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { FlashBanner } from "@/components/admin/flash-banner";
import { getAdminConfig } from "@/lib/admin-config";

export default async function ConfigPage({
  searchParams
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const config = await getAdminConfig();
  const query = (await searchParams) ?? {};

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <AdminSectionHeader
        title="Global Config"
        description="Manage business-owned runtime settings without deployment changes."
        actions={
          <>
            <button className="button-secondary">Reset changes</button>
            <button className="button-primary">Save config</button>
          </>
        }
      />
      {query.success ? <FlashBanner kind="success" message={query.success} /> : null}
      {query.error ? <FlashBanner kind="error" message={query.error} /> : null}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(320px, 1fr)",
          gap: 16
        }}
      >
        <form action={submitConfigUpdate} className="card" style={{ padding: 20 }}>
          <input type="hidden" name="returnPath" value="/admin/config" />
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 18, lineHeight: "26px" }}>
            Runtime settings
          </h2>

          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <p className="field-label">Registration minimum age</p>
              <input
                className="text-input"
                type="number"
                name="registration_min_age"
                defaultValue={config.registrationMinAge}
              />
              <p className="section-subtitle" style={{ marginTop: 8 }}>
                This value overrides the environment fallback used by onboarding.
              </p>
            </div>

            <div>
              <p className="field-label">Content moderation provider</p>
              <select
                className="select-input"
                name="content_moderation_provider"
                defaultValue={config.contentModerationProvider}
              >
                <option>OpenAI moderation</option>
                <option>Internal moderation</option>
                <option>Hybrid provider</option>
              </select>
            </div>

            <div
              className="card"
              style={{
                padding: 16,
                display: "grid",
                gap: 14,
                background: "var(--surface-subtle)"
              }}
            >
              <label style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
                <div>
                  <strong style={{ display: "block", fontSize: 14 }}>Content moderation enabled</strong>
                  <span className="muted" style={{ fontSize: 12 }}>
                    Disabling this should require a deliberate operations decision.
                  </span>
                </div>
                <input
                  type="checkbox"
                  name="content_moderation_enabled"
                  defaultChecked={config.contentModerationEnabled}
                />
              </label>

              <label style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
                <div>
                  <strong style={{ display: "block", fontSize: 14 }}>Fail open on provider error</strong>
                  <span className="muted" style={{ fontSize: 12 }}>
                    When disabled, moderation failures should block publishing until retried.
                  </span>
                </div>
                <input
                  type="checkbox"
                  name="content_moderation_fail_open"
                  defaultChecked={config.contentModerationFailOpen}
                />
              </label>
            </div>

            <div className="card" style={{ padding: 16, borderColor: "rgba(186,26,26,0.2)" }}>
              <p className="field-label" style={{ color: "var(--danger)" }}>
                Production warning
              </p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: "22px" }}>
                Disabling moderation in production should trigger an explicit confirmation step before save. The final API integration should enforce this guard both in UI and server-side validation.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
            <ConfirmSubmitButton
              className="button-primary"
              confirmMessage="Save these runtime configuration changes?"
              pendingText="Saving..."
            >
              Save config
            </ConfirmSubmitButton>
          </div>
        </form>

        <aside style={{ display: "grid", gap: 16, alignSelf: "start" }}>
          <article className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 14, fontSize: 16, lineHeight: "24px" }}>
              Current snapshot
            </h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div className="card" style={{ padding: 12 }}>
                <p className="field-label">App version</p>
                <strong style={{ fontSize: 13 }}>{config.appVersion}</strong>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <p className="field-label">Moderation status</p>
                <strong style={{ fontSize: 13 }}>
                  {config.contentModerationEnabled ? "Enabled" : "Disabled"}
                </strong>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <p className="field-label">Fail-open policy</p>
                <strong style={{ fontSize: 13 }}>
                  {config.contentModerationFailOpen ? "Enabled" : "Disabled"}
                </strong>
              </div>
            </div>
          </article>

          <article className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 14, fontSize: 16, lineHeight: "24px" }}>
              Change guidance
            </h2>
            <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
              <li>Review production impact before reducing moderation safeguards.</li>
              <li>Document changes in the internal admin action log when connected.</li>
              <li>Confirm min-age changes with compliance stakeholders.</li>
            </ul>
          </article>
        </aside>
      </section>
    </div>
  );
}
