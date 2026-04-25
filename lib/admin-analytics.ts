import { adminApiGet } from "@/lib/admin-api-server";
import { formatNumber, startCase } from "@/lib/format";

type MetricWindowResponse = {
  today: number;
  last_7_days: number;
  last_30_days: number;
};

type AdminAnalyticsUsersResponse = {
  total_users: number;
  users_by_status: Record<string, number>;
  verified_email_users: number;
  verified_phone_users: number;
  users_with_primary_email: number;
  new_users: MetricWindowResponse;
  active_users: MetricWindowResponse;
  suspended_users: number;
  warned_users: number;
};

type AdminAnalyticsContentResponse = {
  posts_created: MetricWindowResponse;
  comments_created: MetricWindowResponse;
  post_reactions_created: MetricWindowResponse;
  comment_reactions_created: MetricWindowResponse;
  total_posts: number;
  total_comments: number;
  deleted_posts: number;
  deleted_comments: number;
  media_posts: number;
};

type AdminAnalyticsModerationResponse = {
  posts_by_moderation_status: Record<string, number>;
  reports_by_status: Record<string, number>;
  reports_by_reason: Record<string, number>;
  moderation_actions_last_30_days: Record<string, number>;
  pending_reports: number;
  action_taken_reports: number;
  dismissed_reports: number;
  posts_pending_moderation: number;
  posts_needing_review: number;
  sensitive_posts: number;
  rejected_posts: number;
};

export async function getAnalyticsSnapshot() {
  const [users, content, moderation] = await Promise.all([
    adminApiGet<AdminAnalyticsUsersResponse>("/api/v1/admin/analytics/users"),
    adminApiGet<AdminAnalyticsContentResponse>("/api/v1/admin/analytics/content"),
    adminApiGet<AdminAnalyticsModerationResponse>("/api/v1/admin/analytics/moderation")
  ]);

  const safeUsers: AdminAnalyticsUsersResponse = users ?? {
    total_users: 0,
    users_by_status: {},
    verified_email_users: 0,
    verified_phone_users: 0,
    users_with_primary_email: 0,
    new_users: { today: 0, last_7_days: 0, last_30_days: 0 },
    active_users: { today: 0, last_7_days: 0, last_30_days: 0 },
    suspended_users: 0,
    warned_users: 0
  };
  const safeContent: AdminAnalyticsContentResponse = content ?? {
    posts_created: { today: 0, last_7_days: 0, last_30_days: 0 },
    comments_created: { today: 0, last_7_days: 0, last_30_days: 0 },
    post_reactions_created: { today: 0, last_7_days: 0, last_30_days: 0 },
    comment_reactions_created: { today: 0, last_7_days: 0, last_30_days: 0 },
    total_posts: 0,
    total_comments: 0,
    deleted_posts: 0,
    deleted_comments: 0,
    media_posts: 0
  };
  const safeModeration: AdminAnalyticsModerationResponse = moderation ?? {
    posts_by_moderation_status: {},
    reports_by_status: {},
    reports_by_reason: {},
    moderation_actions_last_30_days: {},
    pending_reports: 0,
    action_taken_reports: 0,
    dismissed_reports: 0,
    posts_pending_moderation: 0,
    posts_needing_review: 0,
    sensitive_posts: 0,
    rejected_posts: 0
  };

  return {
    users: {
      totalUsers: formatNumber(safeUsers.total_users),
      verifiedEmailUsers: formatNumber(safeUsers.verified_email_users),
      verifiedPhoneUsers: formatNumber(safeUsers.verified_phone_users),
      newUsers: formatNumber(safeUsers.new_users.last_30_days),
      activeUsers: formatNumber(safeUsers.active_users.last_30_days),
      suspendedUsers: formatNumber(safeUsers.suspended_users),
      warnedUsers: formatNumber(safeUsers.warned_users)
    },
    content: {
      postsCreated: formatNumber(safeContent.posts_created.last_30_days),
      commentsCreated: formatNumber(safeContent.comments_created.last_30_days),
      totalPosts: formatNumber(safeContent.total_posts),
      totalComments: formatNumber(safeContent.total_comments),
      deletedPosts: formatNumber(safeContent.deleted_posts),
      mediaPosts: formatNumber(safeContent.media_posts)
    },
    moderation: {
      pendingReports: formatNumber(safeModeration.pending_reports),
      actionTakenReports: formatNumber(safeModeration.action_taken_reports),
      dismissedReports: formatNumber(safeModeration.dismissed_reports),
      postsPendingModeration: formatNumber(safeModeration.posts_pending_moderation),
      postsNeedingReview: formatNumber(safeModeration.posts_needing_review),
      sensitivePosts: formatNumber(safeModeration.sensitive_posts),
      rejectedPosts: formatNumber(safeModeration.rejected_posts)
    },
    moderationBreakdown: Object.entries(safeModeration.posts_by_moderation_status).length
      ? Object.entries(safeModeration.posts_by_moderation_status).map(([label, value]) => ({
          label: startCase(label),
          value,
          tone:
            label === "REJECTED"
              ? ("danger" as const)
              : label === "SENSITIVE"
                ? ("warning" as const)
                : label === "NEEDS_REVIEW" || label === "PENDING"
                  ? ("review" as const)
                  : ("info" as const)
        }))
      : [{ label: "Pending", value: 0, tone: "review" as const }],
    reportReasonMix: Object.entries(safeModeration.reports_by_reason).length
      ? Object.entries(safeModeration.reports_by_reason).map(([label, value]) => ({
          label: startCase(label),
          value,
          tone:
            label === "HARASSMENT"
              ? ("danger" as const)
              : label === "SPAM"
                ? ("info" as const)
                : label === "OTHER"
                  ? ("warning" as const)
                  : ("review" as const)
        }))
      : [{ label: "No reports yet", value: 0, tone: "info" as const }]
  };
}

