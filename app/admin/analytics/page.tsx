import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAnalyticsSnapshot } from "@/lib/admin-analytics";

export default async function AnalyticsPage() {
  const analytics = await getAnalyticsSnapshot();

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <AdminSectionHeader
        title="Analytics"
        description="Operational reporting across users, content, and moderation health."
        actions={
          <>
            <button className="button-secondary">Last 30 days</button>
            <button className="button-primary">Export later</button>
          </>
        }
      />

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
        <article className="card" style={{ padding: 20 }}>
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 16, lineHeight: "24px" }}>
            Users
          </h2>
          <div style={{ display: "grid", gap: 12 }}>
            <div className="card" style={{ padding: 12 }}>
              <p className="field-label">Total users</p>
              <strong style={{ fontSize: 18 }}>{analytics.users.totalUsers}</strong>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <p className="field-label">New users</p>
              <strong style={{ fontSize: 18 }}>{analytics.users.newUsers}</strong>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <p className="field-label">Active users</p>
              <strong style={{ fontSize: 18 }}>{analytics.users.activeUsers}</strong>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <p className="field-label">Verified email / phone</p>
              <strong style={{ fontSize: 13 }}>
                {analytics.users.verifiedEmailUsers} / {analytics.users.verifiedPhoneUsers}
              </strong>
            </div>
          </div>
        </article>

        <article className="card" style={{ padding: 20 }}>
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 16, lineHeight: "24px" }}>
            Content
          </h2>
          <div style={{ display: "grid", gap: 12 }}>
            <div className="card" style={{ padding: 12 }}>
              <p className="field-label">Posts created</p>
              <strong style={{ fontSize: 18 }}>{analytics.content.postsCreated}</strong>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <p className="field-label">Comments created</p>
              <strong style={{ fontSize: 18 }}>{analytics.content.commentsCreated}</strong>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <p className="field-label">Total posts / comments</p>
              <strong style={{ fontSize: 13 }}>
                {analytics.content.totalPosts} / {analytics.content.totalComments}
              </strong>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <p className="field-label">Media posts / deleted posts</p>
              <strong style={{ fontSize: 13 }}>
                {analytics.content.mediaPosts} / {analytics.content.deletedPosts}
              </strong>
            </div>
          </div>
        </article>

        <article className="card" style={{ padding: 20 }}>
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 16, lineHeight: "24px" }}>
            Moderation
          </h2>
          <div style={{ display: "grid", gap: 12 }}>
            <div className="card" style={{ padding: 12 }}>
              <p className="field-label">Pending reports</p>
              <strong style={{ fontSize: 18 }}>{analytics.moderation.pendingReports}</strong>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <p className="field-label">Posts pending moderation</p>
              <strong style={{ fontSize: 18 }}>{analytics.moderation.postsPendingModeration}</strong>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <p className="field-label">Needs review / sensitive</p>
              <strong style={{ fontSize: 13 }}>
                {analytics.moderation.postsNeedingReview} / {analytics.moderation.sensitivePosts}
              </strong>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <p className="field-label">Action taken / dismissed</p>
              <strong style={{ fontSize: 13 }}>
                {analytics.moderation.actionTakenReports} / {analytics.moderation.dismissedReports}
              </strong>
            </div>
          </div>
        </article>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
          gap: 16
        }}
      >
        <article className="card" style={{ padding: 20 }}>
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 16, lineHeight: "24px" }}>
            Moderation breakdown
          </h2>
          <div style={{ display: "grid", gap: 14 }}>
            {analytics.moderationBreakdown.map((entry) => (
              <div key={entry.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 8
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{entry.label}</span>
                  <StatusBadge tone={entry.tone}>{entry.value}</StatusBadge>
                </div>
                <div
                  style={{
                    height: 10,
                    background: "#eef2f7",
                    borderRadius: 999,
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(entry.value * 3, 100)}%`,
                      height: "100%",
                      background:
                        entry.tone === "danger"
                          ? "var(--danger)"
                          : entry.tone === "review"
                            ? "var(--review)"
                            : entry.tone === "warning"
                              ? "var(--warning)"
                              : "var(--info)"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card" style={{ padding: 20 }}>
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 16, lineHeight: "24px" }}>
            Report reason mix
          </h2>
          <div style={{ display: "grid", gap: 12 }}>
            {analytics.reportReasonMix.map((entry) => (
              <div
                key={entry.label}
                className="card"
                style={{
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>{entry.label}</span>
                <StatusBadge tone={entry.tone}>{entry.value}%</StatusBadge>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
