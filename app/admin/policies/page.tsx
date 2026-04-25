import { submitPolicyCreate } from "@/app/admin/actions";
import Link from "next/link";

import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { EmptyState } from "@/components/admin/empty-state";
import { FlashBanner } from "@/components/admin/flash-banner";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { StatusBadge } from "@/components/admin/status-badge";
import { getPolicies, getPolicySummary } from "@/lib/admin-policies";

export default async function PoliciesPage({
  searchParams
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const policies = await getPolicies();
  const summary = await getPolicySummary();
  const draftPolicy =
    policies.find((policy) => policy.policyType === "COMMUNITY_GUIDELINES") ?? policies[0] ?? null;
  const query = (await searchParams) ?? {};

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <AdminSectionHeader
        title="Policies"
        description="Review and manage privacy, terms, community, and age-verification policy versions."
        actions={
          <>
            <button className="button-secondary">Filter by type</button>
            <button className="button-primary">Create new draft</button>
          </>
        }
      />
      {query.success ? <FlashBanner kind="success" message={query.success} /> : null}
      {query.error ? <FlashBanner kind="error" message={query.error} /> : null}

      <form action={submitPolicyCreate} className="card" style={{ padding: 16, display: "grid", gap: 12 }}>
        <input type="hidden" name="returnPath" value="/admin/policies" />
        <h2 style={{ margin: 0, fontSize: 16, lineHeight: "24px" }}>Create policy draft</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
          <select className="select-input" name="policy_type" defaultValue="COMMUNITY_GUIDELINES">
            <option value="PRIVACY_POLICY">PRIVACY_POLICY</option>
            <option value="TERMS_OF_SERVICE">TERMS_OF_SERVICE</option>
            <option value="COMMUNITY_GUIDELINES">COMMUNITY_GUIDELINES</option>
            <option value="AGE_VERIFICATION_POLICY">AGE_VERIFICATION_POLICY</option>
          </select>
          <input className="text-input" name="title" placeholder="Policy title" />
          <FormSubmitButton className="button-primary" pendingText="Creating...">
            Create draft
          </FormSubmitButton>
        </div>
        <textarea
          className="textarea-input"
          name="content_markdown"
          defaultValue="# New Policy Draft"
        />
      </form>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 420px) minmax(0, 1fr)",
          gap: 16
        }}
      >
        <div style={{ display: "grid", gap: 12 }}>
          {policies.map((policy) => (
            <article
              key={policy.id}
              className="card"
              style={{
                padding: 16,
                borderColor:
                  policy.policyType === "COMMUNITY_GUIDELINES"
                    ? "var(--primary-strong)"
                    : undefined,
                borderWidth: policy.policyType === "COMMUNITY_GUIDELINES" ? 2 : 1
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  gap: 12,
                  marginBottom: 10
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, lineHeight: "24px" }}>{policy.title}</h2>
                  <p className="section-subtitle" style={{ marginTop: 4 }}>
                    {policy.version} | {policy.policyType}
                  </p>
                </div>
                <StatusBadge tone={policy.statusTone}>
                  {policy.isCurrent ? "Current" : policy.isPublished ? "Published" : "Draft"}
                </StatusBadge>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <span className="muted" style={{ fontSize: 12 }}>
                  Effective: {policy.effectiveAt}
                </span>
                {policy.draftSummary ? (
                  <div className="card" style={{ padding: 12 }}>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: "20px" }}>{policy.draftSummary}</p>
                  </div>
                ) : null}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <Link className="button-secondary" href={`/admin/policies/${policy.id}`}>
                  View live
                </Link>
                <Link className="button-primary" href={`/admin/policies/${policy.id}`}>
                  Edit
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <article className="card" style={{ padding: 20, minHeight: 680 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 16
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 18, lineHeight: "26px" }}>
                  Edit: {draftPolicy?.title ?? "No draft selected"}
                </h2>
                <p className="section-subtitle" style={{ marginTop: 4 }}>
                  {draftPolicy ? `Version ${draftPolicy.version}` : "No policy data returned yet"}
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="button-secondary">Save draft</button>
                <button className="button-primary">Publish policy</button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.6fr) minmax(260px, 1fr)",
                gap: 16,
                height: "calc(100% - 68px)"
              }}
            >
              <div
                className="card"
                style={{
                  padding: 16,
                  background: "var(--surface-subtle)",
                  display: "grid"
                }}
              >
                <textarea
                  className="textarea-input"
                  style={{ minHeight: 500, border: "none", background: "transparent" }}
                  defaultValue={draftPolicy?.contentMarkdown ?? "No policy markdown returned by the API yet."}
                />
              </div>
              <div className="card" style={{ padding: 16 }}>
                <p className="field-label">Live preview</p>
                <div style={{ display: "grid", gap: 12 }}>
                  <h3 style={{ margin: 0 }}>{draftPolicy?.title ?? "Policy preview"}</h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: "22px" }}>
                    {draftPolicy
                      ? "Preview uses the current selected policy detail. Rich markdown rendering can be added after the mutation flows are connected."
                      : "No policy records are available yet in the dev database."}
                  </p>
                  {draftPolicy ? (
                    <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
                      <li>Policy type: {draftPolicy.policyType}</li>
                      <li>Current version: {draftPolicy.version}</li>
                      <li>Effective at: {draftPolicy.effectiveAt}</li>
                    </ul>
                  ) : null}
                </div>
              </div>
            </div>
          </article>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 16
            }}
          >
            <article className="card" style={{ padding: 16 }}>
              <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>Recent activity</h3>
              <div style={{ display: "grid", gap: 10 }}>
                {summary.recentActivity.map((entry) => (
                  <div key={entry.label} className="card" style={{ padding: 12 }}>
                    <strong style={{ display: "block", fontSize: 13 }}>{entry.label}</strong>
                    <span className="muted" style={{ fontSize: 12 }}>{entry.when}</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="card" style={{ padding: 16 }}>
              <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>Pending approval</h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: "22px" }}>{summary.pendingApproval}</p>
            </article>
            <article
              className="card"
              style={{
                padding: 16,
                background: "linear-gradient(135deg, var(--primary), var(--primary-strong))",
                color: "white"
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>Legal compliance</h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: "22px",
                  color: "rgba(255,255,255,0.86)"
                }}
              >
                Current policies meet the planned 2026 compliance review baseline. Certificate export can be added later.
              </p>
            </article>
          </section>
        </div>
      </section>

      {policies.length === 0 ? (
        <EmptyState
          title="No policy versions yet"
          description="The policies endpoint is currently empty in the dev environment, so the page is showing editor scaffolding with no live records."
        />
      ) : null}
    </div>
  );
}
