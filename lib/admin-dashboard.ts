import { adminApiGet } from "@/lib/admin-api-server";
import { formatCompactNumber, formatNumber, startCase } from "@/lib/format";
import { getModerationQueue } from "@/lib/admin-moderation";

type MetricWindowResponse = {
  today: number;
  last_7_days: number;
  last_30_days: number;
};

type AdminAnalyticsOverviewResponse = {
  total_users: number;
  new_users: MetricWindowResponse;
  active_users: MetricWindowResponse;
  posts_created: MetricWindowResponse;
  comments_created: MetricWindowResponse;
  reports_submitted: MetricWindowResponse;
  posts_pending_moderation: number;
  posts_needing_review: number;
  pending_reports: number;
  suspended_users: number;
};

type AdminAnalyticsModerationResponse = {
  reports_by_reason: Record<string, number>;
  pending_reports: number;
  posts_pending_moderation: number;
  posts_needing_review: number;
};

export type DashboardKpi = {
  label: string;
  value: string;
  badge?: string;
  tone: "success" | "warning" | "review" | "danger" | "info";
  helper: string;
};

export type DashboardTrendPoint = {
  label: string;
  activeUsers: number;
  newUsers: number;
};

export type ModerationActivity = {
  id: string;
  postId: string;
  author: string;
  reason: string;
  status: string;
  tone: "success" | "warning" | "review" | "danger" | "info";
  time: string;
};

export type DashboardSnapshot = {
  kpis: DashboardKpi[];
  growth: DashboardTrendPoint[];
  reportBreakdown: {
    label: string;
    value: number;
    tone: "success" | "warning" | "review" | "danger" | "info";
  }[];
  urgentActions: {
    label: string;
    tone: "warning" | "review" | "danger" | "info";
  }[];
  recentModeration: ModerationActivity[];
};

function toneFromValue(
  tone: string
): "success" | "warning" | "review" | "danger" | "info" {
  if (tone.includes("REJECT") || tone.includes("BLOCK") || tone.includes("DISMISS")) {
    return "danger";
  }

  if (tone.includes("REVIEW") || tone.includes("PENDING")) {
    return "review";
  }

  if (tone.includes("APPROVE") || tone.includes("ACTION")) {
    return "success";
  }

  if (tone.includes("SENSITIVE")) {
    return "warning";
  }

  return "info";
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [overview, moderation, queue] = await Promise.all([
    adminApiGet<AdminAnalyticsOverviewResponse>("/api/v1/admin/analytics/overview"),
    adminApiGet<AdminAnalyticsModerationResponse>("/api/v1/admin/analytics/moderation"),
    getModerationQueue({ limit: 4 })
  ]);

  const safeOverview: AdminAnalyticsOverviewResponse = overview ?? {
    total_users: 0,
    new_users: { today: 0, last_7_days: 0, last_30_days: 0 },
    active_users: { today: 0, last_7_days: 0, last_30_days: 0 },
    posts_created: { today: 0, last_7_days: 0, last_30_days: 0 },
    comments_created: { today: 0, last_7_days: 0, last_30_days: 0 },
    reports_submitted: { today: 0, last_7_days: 0, last_30_days: 0 },
    posts_pending_moderation: 0,
    posts_needing_review: 0,
    pending_reports: 0,
    suspended_users: 0
  };

  const reasonEntries = Object.entries(moderation?.reports_by_reason ?? {});
  const reportTotal = reasonEntries.reduce((sum, [, count]) => sum + count, 0);
  const reportBreakdown =
    reasonEntries.length > 0
      ? reasonEntries.map(([label, count]) => ({
          label: startCase(label),
          value: reportTotal > 0 ? Math.round((count / reportTotal) * 100) : 0,
          tone: toneFromValue(label)
        }))
      : [{ label: "No reports yet", value: 0, tone: "info" as const }];

  const urgentActions = [
    {
      label: `${safeOverview.posts_needing_review} posts currently need manual review`,
      tone: safeOverview.posts_needing_review > 0 ? "danger" : "info"
    },
    {
      label: `${safeOverview.pending_reports} user reports are waiting for action`,
      tone: safeOverview.pending_reports > 0 ? "review" : "info"
    },
    {
      label: `${safeOverview.suspended_users} users are currently suspended`,
      tone: safeOverview.suspended_users > 0 ? "warning" : "info"
    }
  ] as const;

  return {
    kpis: [
      {
        label: "Total users",
        value: formatCompactNumber(safeOverview.total_users),
        badge: `${safeOverview.new_users.last_30_days} new`,
        tone: "success",
        helper: `Last 30 days: ${formatNumber(safeOverview.new_users.last_30_days)} signups`
      },
      {
        label: "New users today",
        value: formatNumber(safeOverview.new_users.today),
        badge: `${safeOverview.active_users.today} active`,
        tone: "info",
        helper: `7 days: ${formatNumber(safeOverview.new_users.last_7_days)}`
      },
      {
        label: "Pending moderation",
        value: formatNumber(safeOverview.posts_pending_moderation),
        tone: "review",
        helper: `${formatNumber(safeOverview.posts_needing_review)} posts need review`
      },
      {
        label: "Pending reports",
        value: formatNumber(safeOverview.pending_reports),
        tone: "danger",
        helper: `${formatNumber(safeOverview.suspended_users)} suspended users`
      }
    ],
    growth: [
      { label: "Today", activeUsers: safeOverview.active_users.today, newUsers: safeOverview.new_users.today },
      { label: "7 Days", activeUsers: safeOverview.active_users.last_7_days, newUsers: safeOverview.new_users.last_7_days },
      { label: "30 Days", activeUsers: safeOverview.active_users.last_30_days, newUsers: safeOverview.new_users.last_30_days }
    ],
    reportBreakdown,
    urgentActions: urgentActions.map((item) => ({ ...item })),
    recentModeration: queue.slice(0, 4).map((item) => ({
      id: item.id,
      postId: item.postId,
      author: item.author,
      reason: item.reason,
      status: item.moderationStatus,
      tone: item.tone,
      time: item.createdAt
    }))
  };
}
