import { adminApiGet } from "@/lib/admin-api-server";
import { formatDateTime, startCase } from "@/lib/format";

type PostAuthorResponse = {
  id: string;
  name: string;
  username?: string | null;
};

type PostMediaItem = {
  url?: string | null;
  thumbnail_url?: string | null;
  type: string;
};

type PostResponse = {
  id: string;
  author: PostAuthorResponse;
  content: string;
  media?: PostMediaItem[];
  created_at: string;
  moderation_status?: string | null;
};

type ModerationQueueItemResponse = {
  post: PostResponse;
  moderation_provider?: string | null;
  moderation_summary?: string | null;
  moderation_confidence?: string | null;
};

type ModerationQueueResponse = {
  data: ModerationQueueItemResponse[];
};

export type ModerationQueueItem = {
  id: string;
  postId: string;
  author: string;
  authorId: string;
  contentSnippet: string;
  contentFull: string;
  hasMedia: boolean;
  mediaLabel: string;
  reason: string;
  confidence: number;
  moderationStatus: string;
  tone: "success" | "warning" | "review" | "danger" | "info";
  createdAt: string;
  provider: string;
  summary: string;
  reviewedBy?: string;
  reviewNote?: string;
  riskLevel: string;
  history: {
    previousViolations: number | null;
    accountAge: string;
    verificationStatus: string;
  };
};

type ModerationQueueFilters = {
  status?: string;
  reason?: string;
  q?: string;
  limit?: number;
  offset?: number;
};

function mapModerationTone(
  status?: string | null
): "success" | "warning" | "review" | "danger" | "info" {
  switch (status) {
    case "APPROVED":
      return "success";
    case "SENSITIVE":
      return "warning";
    case "NEEDS_REVIEW":
    case "PENDING":
      return "review";
    case "REJECTED":
    case "REMOVED_BY_ADMIN":
      return "danger";
    default:
      return "info";
  }
}

function parseConfidence(value?: string | null) {
  if (!value) {
    return 0;
  }

  const numeric = Number.parseFloat(value);
  return Number.isNaN(numeric) ? 0 : Math.round(numeric * (numeric <= 1 ? 100 : 1));
}

function mapQueueItem(item: ModerationQueueItemResponse): ModerationQueueItem {
  const status = item.post.moderation_status ?? "PENDING";
  const firstMedia = item.post.media?.[0];

  return {
    id: item.post.id,
    postId: item.post.id,
    author: item.post.author.name,
    authorId: item.post.author.id,
    contentSnippet: item.post.content || "No content",
    contentFull: item.post.content || "No content available for this post.",
    hasMedia: Boolean(firstMedia),
    mediaLabel: firstMedia?.thumbnail_url || firstMedia?.url || "No media",
    reason: item.moderation_summary ?? "Moderation flag",
    confidence: parseConfidence(item.moderation_confidence),
    moderationStatus: startCase(status),
    tone: mapModerationTone(status),
    createdAt: formatDateTime(item.post.created_at),
    provider: item.moderation_provider ?? "Not provided",
    summary: item.moderation_summary ?? "No moderation summary provided by the API.",
    reviewedBy: "Not exposed by API yet",
    reviewNote: "Current moderation queue response does not include review notes.",
    riskLevel:
      status === "NEEDS_REVIEW"
        ? "Needs manual review"
        : status === "REJECTED" || status === "REMOVED_BY_ADMIN"
          ? "High risk"
          : status === "SENSITIVE"
            ? "Sensitive handling"
            : "Operational queue",
    history: {
      previousViolations: null,
      accountAge: "Not exposed by API yet",
      verificationStatus: "Not exposed by API yet"
    }
  };
}

export async function getModerationQueue(
  filters: ModerationQueueFilters = {}
): Promise<ModerationQueueItem[]> {
  const response = await adminApiGet<ModerationQueueResponse>(
    "/api/v1/admin/posts/moderation-queue",
    {
      query: {
        ...(filters.status && filters.status !== "All"
          ? { status: filters.status.toUpperCase().replaceAll(" ", "_") }
          : {}),
        limit: filters.limit ?? 50,
        offset: filters.offset ?? 0
      }
    }
  );

  const mapped = (response?.data ?? []).map(mapQueueItem);
  const query = filters.q?.trim().toLowerCase();

  return mapped.filter((item) => {
    const matchesReason =
      !filters.reason ||
      filters.reason === "All" ||
      item.reason.toLowerCase().includes(filters.reason.toLowerCase());
    const matchesQuery =
      !query ||
      item.author.toLowerCase().includes(query) ||
      item.postId.toLowerCase().includes(query) ||
      item.contentSnippet.toLowerCase().includes(query);

    return matchesReason && matchesQuery;
  });
}

export async function getModerationItemById(id?: string): Promise<ModerationQueueItem | null> {
  const items = await getModerationQueue();

  if (!id) {
    return items[0] ?? null;
  }

  return items.find((item) => item.id === id) ?? items[0] ?? null;
}
