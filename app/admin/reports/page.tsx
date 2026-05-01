import Link from "next/link";

import { submitReportAction } from "@/app/admin/actions";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/admin/empty-state";
import { FlashBanner } from "@/components/admin/flash-banner";
import { FilterBar } from "@/components/admin/filter-bar";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { getReportById, getReports } from "@/lib/admin-reports";

export default async function ReportsPage({
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
  const reports = await getReports({
    status: params.status,
    reason: params.reason,
    q: params.q
  });
  const selectedReport = await getReportById(params.item ?? reports[0]?.id);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <AdminSectionHeader
        title="Reports"
        description="Review user-submitted reports separately from automated moderation flags."
        actions={
          <>
            <button className="button-secondary">Saved filters</button>
            <button className="button-primary">Escalation notes</button>
          </>
        }
      />

      {params.success ? <FlashBanner kind="success" message={params.success} /> : null}
      {params.error ? <FlashBanner kind="error" message={params.error} /> : null}

      <FilterBar
        fields={[
          { id: "status", label: "Status", type: "select", options: ["All", "Pending", "Reviewed", "Dismissed", "Action Taken"] },
          { id: "reason", label: "Reason", type: "input", inputType: "text" },
          { id: "date", label: "Date range", type: "input", inputType: "date" },
          { id: "search", label: "Search", type: "input", inputType: "text" }
        ]}
      />

      <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.7fr) minmax(320px, 1fr)", gap: 16 }}>
        <article className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: 16, borderBottom: "1px solid #edf1f6", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, lineHeight: "24px" }}>Report Queue ({reports.length} items)</h2>
              <p className="section-subtitle" style={{ marginTop: 4 }}>
                User-driven reports need a separate review lens from provider moderation.
              </p>
            </div>
            <StatusBadge tone="danger">Pending review</StatusBadge>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Target</th>
                  <th>Reason</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Reported by</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  const isSelected = selectedReport?.id === report.id;

                  return (
                    <tr key={report.id} style={isSelected ? { background: "var(--primary-soft)" } : undefined}>
                      <td className="mono">
                        <Link href={`/admin/reports?item=${report.id}`}>{report.id}</Link>
                      </td>
                      <td>
                        <div style={{ display: "grid", gap: 2 }}>
                          <strong style={{ fontSize: 13 }}>{report.targetType}</strong>
                          <span className="muted" style={{ fontSize: 11 }}>{report.targetObjectId}</span>
                        </div>
                      </td>
                      <td><StatusBadge tone={report.tone}>{report.reason}</StatusBadge></td>
                      <td style={{ maxWidth: 280 }}><span className="muted">{report.description}</span></td>
                      <td><StatusBadge tone={report.tone}>{report.status}</StatusBadge></td>
                      <td>{report.reportedBy}</td>
                      <td>{report.createdAt}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <Link className="button-secondary" href={`/admin/reports?item=${report.id}`}>Review</Link>
                          <form action={submitReportAction}>
                            <input type="hidden" name="reportId" value={report.id} />
                            <input type="hidden" name="returnPath" value={`/admin/reports?item=${report.id}`} />
                            <FormSubmitButton
                              className="button-secondary"
                              name="action"
                              value="reviewed"
                              pendingText="Reviewing..."
                            >
                              Review
                            </FormSubmitButton>
                          </form>
                          <form action={submitReportAction}>
                            <input type="hidden" name="reportId" value={report.id} />
                            <input type="hidden" name="returnPath" value={`/admin/reports?item=${report.id}`} />
                            <ConfirmSubmitButton
                              className="button-secondary"
                              name="action"
                              value="dismiss"
                              confirmMessage="Dismiss this report?"
                              pendingText="Dismissing..."
                            >
                              Dismiss
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

          <div style={{ padding: 16, borderTop: "1px solid #edf1f6", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span className="muted" style={{ fontSize: 13 }}>Showing 1-{reports.length} of {reports.length} reports</span>
            <Pagination page={1} totalPages={Math.max(1, Math.ceil(Math.max(reports.length, 1) / 10))} />
          </div>
        </article>

        {selectedReport ? (
          <aside className="card" style={{ overflow: "hidden", alignSelf: "start" }}>
            <div style={{ padding: 16, borderBottom: "1px solid #edf1f6", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, lineHeight: "24px" }}>Report details</h2>
                <p className="section-subtitle" style={{ marginTop: 4 }}>{selectedReport.id} | {selectedReport.targetType}</p>
              </div>
              <StatusBadge tone={selectedReport.tone}>{selectedReport.status}</StatusBadge>
            </div>

            <div style={{ padding: 16, display: "grid", gap: 18 }}>
              <div className="card" style={{ padding: 14 }}>
                <p className="field-label">Summary</p>
                <strong style={{ fontSize: 14 }}>{selectedReport.description}</strong>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                <div className="card" style={{ padding: 12 }}>
                  <p className="field-label">Reporter</p>
                  <strong style={{ fontSize: 13 }}>{selectedReport.reportedBy}</strong>
                </div>
                <div className="card" style={{ padding: 12 }}>
                  <p className="field-label">Submitted</p>
                  <strong style={{ fontSize: 13 }}>{selectedReport.createdAt}</strong>
                </div>
                <div className="card" style={{ padding: 12 }}>
                  <p className="field-label">Reviewed by</p>
                  <strong style={{ fontSize: 13 }}>{selectedReport.reviewedBy}</strong>
                </div>
                <div className="card" style={{ padding: 12 }}>
                  <p className="field-label">Reviewed at</p>
                  <strong style={{ fontSize: 13 }}>{selectedReport.reviewedAt}</strong>
                </div>
              </div>

              <div className="card" style={{ padding: 14 }}>
                <p className="field-label">Reporter profile</p>
                <p style={{ margin: 0, fontSize: 14, lineHeight: "22px" }}>{selectedReport.reporterProfile}</p>
              </div>

              <div className="card" style={{ padding: 14 }}>
                <p className="field-label">Related context</p>
                <p style={{ margin: 0, fontSize: 14, lineHeight: "22px" }}>{selectedReport.contextSummary}</p>
              </div>

              <div className="card" style={{ padding: 14 }}>
                <p className="field-label">History note</p>
                <p style={{ margin: 0, fontSize: 14, lineHeight: "22px" }}>{selectedReport.historyNote}</p>
              </div>

              <div>
                <p className="field-label">Review note</p>
                <form action={submitReportAction} style={{ display: "grid", gap: 12 }}>
                  <input type="hidden" name="reportId" value={selectedReport.id} />
                  <input type="hidden" name="returnPath" value={`/admin/reports?item=${selectedReport.id}`} />
                  <textarea
                    className="textarea-input"
                    name="note"
                    defaultValue="Capture the outcome, moderation action, and any follow-up required for the user or trust-and-safety team."
                  />

                  <div style={{ paddingTop: 4, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                    <ConfirmSubmitButton
                      className="button-secondary"
                      name="action"
                      value="dismiss"
                      confirmMessage="Dismiss this report?"
                      pendingText="Dismissing..."
                    >
                      Dismiss
                    </ConfirmSubmitButton>
                    <FormSubmitButton
                      className="button-primary"
                      name="action"
                      value="action_taken"
                      pendingText="Updating..."
                    >
                      Mark action taken
                    </FormSubmitButton>
                    <FormSubmitButton
                      className="button-secondary"
                      name="action"
                      value="reviewed"
                      pendingText="Reviewing..."
                    >
                      Move to reviewed
                    </FormSubmitButton>
                    <Link href={`/admin/moderation?item=${selectedReport.targetObjectId}`} className="button-secondary" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                      Open target record
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </aside>
        ) : reports.length > 0 ? (
          <EmptyState
            title="Select a report"
            description="Choose a report from the queue to inspect its context and submit a review outcome."
          />
        ) : null}
      </section>

      {reports.length === 0 ? (
        <EmptyState
          title="No reports found"
          description="The reports endpoint returned an empty list. This matches the current dev database state."
        />
      ) : null}
    </div>
  );
}
