import Link from "next/link";

import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { KpiCard } from "@/components/admin/kpi-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { getDashboardSnapshot } from "@/lib/admin-dashboard";

export default async function AdminDashboardPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <AdminSectionHeader
        title="System Overview"
        description="Real-time performance and community health metrics for launch operations."
        actions={
          <>
            <button className="button-secondary">Last 24 hours</button>
            <button className="button-primary">Export data</button>
          </>
        }
      />

      <section className="kpi-grid">
        {snapshot.kpis.map((item) => (
          <KpiCard key={item.label} {...item} />
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(320px, 1fr)",
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
              gap: 16
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 16, lineHeight: "24px" }}>
                User Growth Analytics
              </h2>
              <p className="section-subtitle" style={{ marginTop: 4 }}>
                Active users vs new users across current API windows
              </p>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span className="pill pill-success">Active users</span>
              <span className="pill pill-info">New users</span>
            </div>
          </div>

          <div
            style={{
              padding: "24px 20px 20px",
              display: "grid",
              gridTemplateColumns: `repeat(${Math.max(snapshot.growth.length, 1)}, minmax(0, 1fr))`,
              gap: 10,
              alignItems: "end",
              minHeight: 320
            }}
          >
            {snapshot.growth.map((point) => (
              <div
                key={point.label}
                style={{
                  display: "grid",
                  gap: 8,
                  justifyItems: "center"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "end",
                    gap: 4,
                    minHeight: 220
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: `${Math.max(point.newUsers * 4, 4)}px`,
                      borderRadius: 999,
                      background: "var(--info-soft)"
                    }}
                  />
                  <div
                    style={{
                      width: 18,
                      height: `${Math.max(point.activeUsers * 2.2, 4)}px`,
                      borderRadius: 999,
                      background: "linear-gradient(180deg, var(--primary-strong), var(--primary))"
                    }}
                  />
                </div>
                <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>
                  {point.label}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="card" style={{ padding: 20 }}>
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 16, lineHeight: "24px" }}>
            Reports Summary
          </h2>
          <div style={{ display: "grid", gap: 16 }}>
            {snapshot.reportBreakdown.map((item) => (
              <div key={item.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 8
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {item.value}%
                  </span>
                </div>
                <div
                  style={{
                    height: 10,
                    borderRadius: 999,
                    background: "#eef2f7",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      width: `${item.value}%`,
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
                                : "var(--primary-strong)"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #edf1f6" }}>
            <p className="field-label" style={{ marginBottom: 12 }}>
              Urgent actions
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              {snapshot.urgentActions.map((action) => (
                <div
                  key={action.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "#f6f8fb"
                  }}
                >
                  <StatusBadge tone={action.tone}>Open</StatusBadge>
                  <span style={{ fontSize: 13 }}>{action.label}</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="card" style={{ overflow: "hidden" }}>
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
              Operational shortcuts
            </h2>
            <p className="section-subtitle" style={{ marginTop: 4 }}>
              Highest-frequency admin surfaces for the first release
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="button-primary" href="/admin/moderation">
              Open moderation queue
            </Link>
            <Link className="button-secondary" href="/admin/reports">
              Review reports
            </Link>
            <Link className="button-secondary" href="/admin/users">
              Inspect users
            </Link>
          </div>
        </div>

        <DataTable
          title="Recent moderation activity"
          description="Latest queue actions and reviews visible from the dashboard."
          columns={[
            { key: "postId", label: "Post ID", className: "mono" },
            { key: "author", label: "Author" },
            { key: "reason", label: "Reason" },
            { key: "status", label: "Status" },
            { key: "time", label: "Time" }
          ]}
          rows={snapshot.recentModeration.map((row) => ({
            ...row,
            postId: <Link href={`/admin/moderation?item=${row.id}`}>{row.postId}</Link>,
            status: <StatusBadge tone={row.tone}>{row.status}</StatusBadge>
          }))}
        />
        {snapshot.recentModeration.length === 0 ? (
          <div style={{ padding: 16 }}>
            <EmptyState
              title="No moderation records yet"
              description="The moderation queue is empty right now, so there is no recent activity to show on the dashboard."
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
