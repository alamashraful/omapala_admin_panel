import { submitPolicyPublish, submitPolicyUpdate } from "@/app/admin/actions";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { FlashBanner } from "@/components/admin/flash-banner";
import { StatusBadge } from "@/components/admin/status-badge";
import { getPolicyById } from "@/lib/admin-policies";

export default async function PolicyDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const policy = await getPolicyById(id);

  if (!policy) {
    return (
      <div style={{ display: "grid", gap: 24 }}>
        <AdminSectionHeader
          title={`Policy Detail: ${id}`}
          description="The requested policy record could not be found in the current mock dataset."
        />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <AdminSectionHeader
        title={policy.title}
        description="Manage draft content, publishing status, and version metadata from one policy detail view."
        actions={
          <>
            <button className="button-secondary">Save draft</button>
            <button className="button-primary">Publish policy</button>
          </>
        }
      />
      {query.success ? <FlashBanner kind="success" message={query.success} /> : null}
      {query.error ? <FlashBanner kind="error" message={query.error} /> : null}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(320px, 1fr)",
          gap: 16
        }}
      >
        <form action={submitPolicyUpdate} className="card" style={{ padding: 20 }}>
          <input type="hidden" name="policyId" value={policy.id} />
          <input type="hidden" name="returnPath" value={`/admin/policies/${policy.id}`} />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, lineHeight: "26px" }}>{policy.title}</h2>
              <p className="section-subtitle" style={{ marginTop: 4 }}>
                {policy.policyType} | Version {policy.version}
              </p>
            </div>
            <StatusBadge tone={policy.statusTone}>
              {policy.isCurrent ? "Current" : policy.isPublished ? "Published" : "Draft"}
            </StatusBadge>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
              marginTop: 18
            }}
          >
            <div className="card" style={{ padding: 12 }}>
              <p className="field-label">Effective at</p>
              <strong style={{ fontSize: 13 }}>{policy.effectiveAt}</strong>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <p className="field-label">Published at</p>
              <strong style={{ fontSize: 13 }}>{policy.publishedAt || "Draft only"}</strong>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <p className="field-label">Created at</p>
              <strong style={{ fontSize: 13 }}>{policy.createdAt}</strong>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <p className="field-label">Updated at</p>
              <strong style={{ fontSize: 13 }}>{policy.updatedAt}</strong>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <p className="field-label">Markdown content</p>
            <input className="text-input" name="title" defaultValue={policy.title} style={{ marginBottom: 12 }} />
            <textarea
              className="textarea-input"
              name="content_markdown"
              style={{ minHeight: 460 }}
              defaultValue={policy.contentMarkdown}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <ConfirmSubmitButton
              className="button-secondary"
              confirmMessage="Save these draft policy changes?"
              pendingText="Saving..."
            >
              Save draft
            </ConfirmSubmitButton>
          </div>
        </form>

        <aside style={{ display: "grid", gap: 16, alignSelf: "start" }}>
          <form action={submitPolicyPublish} className="card" style={{ padding: 20 }}>
            <input type="hidden" name="policyId" value={policy.id} />
            <input type="hidden" name="returnPath" value={`/admin/policies/${policy.id}`} />
            <h2 style={{ marginTop: 0, marginBottom: 14, fontSize: 16, lineHeight: "24px" }}>
              Publish controls
            </h2>
            <div style={{ display: "grid", gap: 10 }}>
              <ConfirmSubmitButton
                className="button-primary"
                confirmMessage="Publish this policy immediately and make it the current version?"
                pendingText="Publishing..."
              >
                Publish immediately
              </ConfirmSubmitButton>
              <button className="button-secondary" type="button">Save draft only</button>
              <button className="button-secondary" type="button">Duplicate as new version</button>
            </div>
          </form>

          <article className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 14, fontSize: 16, lineHeight: "24px" }}>
              Metadata
            </h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div className="card" style={{ padding: 12 }}>
                <p className="field-label">Published by</p>
                <strong style={{ fontSize: 13 }}>{policy.publishedBy || "Not published yet"}</strong>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <p className="field-label">Current version</p>
                <strong style={{ fontSize: 13 }}>{policy.isCurrent ? "Yes" : "No"}</strong>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <p className="field-label">Immediate publish only</p>
                <strong style={{ fontSize: 13 }}>Future scheduling not enabled</strong>
              </div>
            </div>
          </article>

          <article className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 14, fontSize: 16, lineHeight: "24px" }}>
              Preview note
            </h2>
            <p style={{ margin: 0, fontSize: 14, lineHeight: "22px" }}>
              Publishing a new version makes it the current policy immediately. Existing users may need to accept the updated version on their next login.
            </p>
          </article>
        </aside>
      </section>
    </div>
  );
}
