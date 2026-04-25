import Link from "next/link";

import { submitModerationAction } from "@/app/admin/actions";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/admin/empty-state";
import { FlashBanner } from "@/components/admin/flash-banner";
import { FilterBar } from "@/components/admin/filter-bar";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { getModerationItemById, getModerationQueue } from "@/lib/admin-moderation";

export default async function ModerationPage({
  searchParams
}: {
  searchParams?: Promise<{
    item?: string;
    status?: string;
    reason?: string;
    q?: string;
    success?: string;
    error?: string;
  }>;
}) {
  const params = (await searchParams) ?? {};
  const queue = await getModerationQueue({
    status: params.status,
    reason: params.reason,
    q: params.q
  });
  const selectedItem = await getModerationItemById(params.item ?? queue[0]?.id);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <AdminSectionHeader
        title="Moderation Queue"
        description="Review flagged posts, inspect moderation metadata, and prepare safe admin actions."
        actions={
          <>
            <button className="button-secondary">Bulk actions</button>
            <button className="button-primary">Escalation guide</button>
          </>
        }
      />

      {params.success ? <FlashBanner kind="success" message={params.success} /> : null}
      {params.error ? <FlashBanner kind="error" message={params.error} /> : null}

      <div style={{ display: "grid", gap: 16 }}>
        <FilterBar
          fields={[
            {
              id: "status",
              label: "Status",
              type: "select",
              options: ["All", "Pending", "Needs Review", "Sensitive", "Approved", "Rejected"]
            },
            {
              id: "reason",
              label: "Flag reason",
              type: "input",
              inputType: "text"
            },
            {
              id: "date",
              label: "Date range",
              type: "input",
              inputType: "date"
            },
            {
              id: "search",
              label: "Search",
              type: "input",
              inputType: "text"
            }
          ]}
        />

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.7fr) minmax(320px, 1fr)",
            gap: 16
          }}
        >
          <article className="card" style={{ overflow: "hidden" }}>
            <div
              style={{
                padding: 16,
                borderBottom: "1px solid #edf1f6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap"
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 16, lineHeight: "24px" }}>
                  Queue ({queue.length} items)
                </h2>
                <p className="section-subtitle" style={{ marginTop: 4 }}>
                  High-confidence items are surfaced first, but every action still requires manual confirmation.
                </p>
              </div>
              <StatusBadge tone="review">Live queue</StatusBadge>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Post ID</th>
                    <th>Author</th>
                    <th>Content snippet</th>
                    <th>Media</th>
                    <th>Reason</th>
                    <th>Confidence</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((item) => {
                    const isSelected = selectedItem?.id === item.id;

                    return (
                      <tr
                        key={item.id}
                        style={isSelected ? { background: "var(--primary-soft)" } : undefined}
                      >
                        <td className="mono">
                          <Link href={`/admin/moderation?item=${item.id}`}>{item.postId}</Link>
                        </td>
                        <td>
                          <div style={{ display: "grid", gap: 2 }}>
                            <strong style={{ fontSize: 13 }}>{item.author}</strong>
                            <span className="muted" style={{ fontSize: 11 }}>
                              {item.authorId}
                            </span>
                          </div>
                        </td>
                        <td style={{ maxWidth: 250 }}>
                          <span className="muted">{item.contentSnippet}</span>
                        </td>
                        <td>{item.hasMedia ? item.mediaLabel : "No media"}</td>
                        <td>
                          <StatusBadge tone={item.tone}>{item.reason}</StatusBadge>
                        </td>
                        <td>
                          <div style={{ display: "grid", gap: 6 }}>
                            <div
                              style={{
                                width: 68,
                                height: 8,
                                borderRadius: 999,
                                background: "#eef2f7",
                                overflow: "hidden"
                              }}
                            >
                              <div
                                style={{
                                  width: `${item.confidence}%`,
                                  height: "100%",
                                  background:
                                    item.tone === "danger"
                                      ? "var(--danger)"
                                      : item.tone === "review"
                                        ? "var(--review)"
                                        : item.tone === "warning"
                                          ? "var(--warning)"
                                          : item.tone === "success"
                                            ? "var(--success)"
                                            : "var(--info)"
                                }}
                              />
                            </div>
                            <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>
                              {item.confidence}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <Link className="button-secondary" href={`/admin/moderation?item=${item.id}`}>
                              Review
                            </Link>
                            <form action={submitModerationAction}>
                              <input type="hidden" name="postId" value={item.id} />
                              <input type="hidden" name="returnPath" value={`/admin/moderation?item=${item.id}`} />
                              <FormSubmitButton
                                className="button-secondary"
                                name="action"
                                value="approve"
                                pendingText="Approving..."
                              >
                                Approve
                              </FormSubmitButton>
                            </form>
                            <form action={submitModerationAction}>
                              <input type="hidden" name="postId" value={item.id} />
                              <input type="hidden" name="returnPath" value={`/admin/moderation?item=${item.id}`} />
                              <ConfirmSubmitButton
                                className="button-secondary"
                                name="action"
                                value="hide"
                                confirmMessage="Hide this post from the moderation queue?"
                              >
                                Hide
                              </ConfirmSubmitButton>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                padding: 16,
                borderTop: "1px solid #edf1f6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap"
              }}
            >
              <span className="muted" style={{ fontSize: 13 }}>
                Showing 1-{queue.length} of {queue.length} queue results
              </span>
              <Pagination page={1} totalPages={Math.max(1, Math.ceil(Math.max(queue.length, 1) / 10))} />
            </div>
          </article>

          {selectedItem ? (
            <aside className="card" style={{ overflow: "hidden", alignSelf: "start" }}>
              <div
                style={{
                  padding: 16,
                  borderBottom: "1px solid #edf1f6",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, lineHeight: "24px" }}>
                    Item details
                  </h2>
                  <p className="section-subtitle" style={{ marginTop: 4 }}>
                    Selected queue record
                  </p>
                </div>
                <StatusBadge tone={selectedItem.tone}>{selectedItem.moderationStatus}</StatusBadge>
              </div>

              <div style={{ padding: 16, display: "grid", gap: 20 }}>
                <div style={{ display: "grid", gap: 4 }}>
                  <strong>{selectedItem.author}</strong>
                  <span className="muted" style={{ fontSize: 12 }}>
                    {selectedItem.authorId} | Posted {selectedItem.createdAt}
                  </span>
                </div>

                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: "var(--surface-muted)",
                    border: "1px solid #edf1f6",
                    display: "grid",
                    gap: 12
                  }}
                >
                  <p style={{ margin: 0, fontSize: 14, lineHeight: "22px" }}>
                    {selectedItem.contentFull}
                  </p>
                  <div
                    style={{
                      minHeight: 120,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 10,
                      border: "1px dashed var(--border)",
                      background: "#fff"
                    }}
                  >
                    <span className="muted" style={{ fontSize: 13 }}>
                      {selectedItem.mediaLabel}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 12
                  }}
                >
                  <div className="card" style={{ padding: 12 }}>
                    <p className="field-label">Detection type</p>
                    <strong style={{ fontSize: 13 }}>{selectedItem.provider}</strong>
                  </div>
                  <div className="card" style={{ padding: 12 }}>
                    <p className="field-label">Risk level</p>
                    <strong style={{ fontSize: 13 }}>{selectedItem.riskLevel}</strong>
                  </div>
                  <div className="card" style={{ padding: 12 }}>
                    <p className="field-label">Confidence</p>
                    <strong style={{ fontSize: 13 }}>{selectedItem.confidence}%</strong>
                  </div>
                  <div className="card" style={{ padding: 12 }}>
                    <p className="field-label">Moderation summary</p>
                    <strong style={{ fontSize: 13 }}>{selectedItem.summary}</strong>
                  </div>
                </div>

                <div>
                  <p className="field-label">Author history</p>
                  <div style={{ display: "grid", gap: 10 }}>
                    <div className="card" style={{ padding: 12 }}>
                      <strong style={{ fontSize: 13 }}>
                        Previous violations: {selectedItem.history.previousViolations ?? "Not exposed"}
                      </strong>
                    </div>
                    <div className="card" style={{ padding: 12 }}>
                      <strong style={{ fontSize: 13 }}>
                        Account age: {selectedItem.history.accountAge}
                      </strong>
                    </div>
                    <div className="card" style={{ padding: 12 }}>
                      <strong style={{ fontSize: 13 }}>
                        Verification: {selectedItem.history.verificationStatus}
                      </strong>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="field-label">Review note</p>
                  <form action={submitModerationAction} style={{ display: "grid", gap: 12 }}>
                    <input type="hidden" name="postId" value={selectedItem.id} />
                    <input type="hidden" name="returnPath" value={`/admin/moderation?item=${selectedItem.id}`} />
                    <textarea
                      className="textarea-input"
                      name="note"
                      defaultValue={
                        selectedItem.reviewNote ||
                        "Add rationale before applying a destructive moderation action."
                      }
                    />

                    <div
                      style={{
                        paddingTop: 4,
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: 10
                      }}
                    >
                      <FormSubmitButton className="button-primary" name="action" value="approve" pendingText="Approving...">
                        Approve
                      </FormSubmitButton>
                      <FormSubmitButton
                        className="button-secondary"
                        name="action"
                        value="sensitive"
                        pendingText="Updating..."
                      >
                        Mark sensitive
                      </FormSubmitButton>
                      <ConfirmSubmitButton
                        className="button-secondary"
                        name="action"
                        value="reject"
                        confirmMessage="Reject this post?"
                        pendingText="Rejecting..."
                      >
                        Reject
                      </ConfirmSubmitButton>
                      <ConfirmSubmitButton
                        className="button-secondary"
                        name="action"
                        value="remove"
                        confirmMessage="Remove this post? This is a destructive moderation action."
                        pendingText="Removing..."
                      >
                        Remove
                      </ConfirmSubmitButton>
                      <FormSubmitButton className="button-secondary" name="action" value="warn" pendingText="Warning...">
                        Warn user
                      </FormSubmitButton>
                      <FormSubmitButton
                        className="button-secondary"
                        name="action"
                        value="temp_suspend"
                        pendingText="Suspending..."
                      >
                        Temp suspend
                      </FormSubmitButton>
                      <ConfirmSubmitButton
                        className="button-secondary"
                        name="action"
                        value="permanent_suspend"
                        confirmMessage="Permanently suspend the author account?"
                        pendingText="Suspending..."
                      >
                        Permanent suspend
                      </ConfirmSubmitButton>
                      <ConfirmSubmitButton
                        className="button-secondary"
                        name="action"
                        value="hide"
                        confirmMessage="Hide this post?"
                        pendingText="Hiding..."
                      >
                        Hide
                      </ConfirmSubmitButton>
                      <ConfirmSubmitButton
                        className="button-secondary"
                        name="action"
                        value="block"
                        confirmMessage="Block this post? This may be difficult to reverse operationally."
                        pendingText="Blocking..."
                      >
                        Block
                      </ConfirmSubmitButton>
                      <FormSubmitButton
                        className="button-secondary"
                        name="action"
                        value="restore"
                        pendingText="Restoring..."
                      >
                        Restore
                      </FormSubmitButton>
                    </div>
                  </form>
                </div>
              </div>
            </aside>
          ) : queue.length > 0 ? (
            <EmptyState
              title="Select a moderation item"
              description="Choose a queue row to inspect full post context and apply moderation actions."
            />
          ) : null}
        </section>

        {queue.length === 0 ? (
          <EmptyState
            title="Moderation queue is empty"
            description="The live moderation endpoint returned no queue items. This is expected in a fresh dev database."
          />
        ) : null}
      </div>
    </div>
  );
}
