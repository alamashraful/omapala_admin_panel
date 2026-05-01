import { adminApiGet } from "@/lib/admin-api-server";
import { formatDateTime, startCase } from "@/lib/format";

type ReportResponse = {
  id: string;
  reported_by: string;
  post_id?: string | null;
  comment_id?: string | null;
  reason: string;
  status: string;
  created_at: string;
  post?: { id: string; content?: string } | null;
  comment?: { id: string; content?: string } | null;
  description?: string;
  content?: string;
};

type AdminReportListResponse = {
  data: ReportResponse[];
  total: number;
};

export type ReportItem = {
  id: string;
  targetType: "POST" | "COMMENT";
  targetObjectId: string;
  reason: string;
  description: string;
  status: string;
  tone: "success" | "warning" | "review" | "danger" | "info";
  reportedBy: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reporterProfile: string;
  contextSummary: string;
  historyNote: string;
};

type ReportFilters = {
  status?: string;
  reason?: string;
  q?: string;
  limit?: number;
  offset?: number;
};

function mapReportTone(
  status: string
): "success" | "warning" | "review" | "danger" | "info" {
  switch (status) {
    case "ACTION_TAKEN":
      return "success";
    case "PENDING":
      return "danger";
    case "REVIEWED":
      return "review";
    case "DISMISSED":
      return "info";
    default:
      return "warning";
  }
}

function mapReport(item: ReportResponse): ReportItem {
  const targetType = item.post_id ? "POST" : "COMMENT";
  const targetObjectId = item.post_id ?? item.comment_id ?? "Not available";
  
  const content = item.post?.content || item.comment?.content || item.content || item.description;

  return {
    id: item.id,
    targetType,
    targetObjectId,
    reason: startCase(item.reason),
    description: content || "The current reports API does not expose report descriptions yet.",
    status: startCase(item.status),
    tone: mapReportTone(item.status),
    reportedBy: item.reported_by,
    createdAt: formatDateTime(item.created_at),
    reviewedBy: "Not exposed by API yet",
    reviewedAt: "Not exposed by API yet",
    reporterProfile: "Reporter profile details are not included in the current admin report response.",
    contextSummary: content ? `Reported content: ${content}` : `${targetType} target ${targetObjectId}. Additional target context is not exposed by the current API.`,
    historyNote: "Review history fields are not exposed by the current report detail response."
  };
}

export async function getReports(filters: ReportFilters = {}) {
  const response = await adminApiGet<AdminReportListResponse>("/api/v1/admin/reports", {
    query: {
      ...(filters.status && filters.status !== "All"
        ? { status: filters.status.toUpperCase().replaceAll(" ", "_") }
        : {}),
      ...(filters.reason && filters.reason !== "All"
        ? { reason: filters.reason.toUpperCase().replaceAll(" ", "_") }
        : {}),
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0
    }
  });

  let mapped = (response?.data ?? []).map(mapReport);

  // Enrich with content from the moderation queue
  try {
    const queueResponse = await adminApiGet<any>("/api/v1/admin/posts/moderation-queue");
    if (queueResponse && queueResponse.data) {
      mapped = mapped.map((report) => {
        const queuedItem = queueResponse.data.find((i: any) => i.post?.id === report.targetObjectId);
        if (queuedItem && queuedItem.post?.content) {
          return {
            ...report,
            description: queuedItem.post.content,
            contextSummary: `Reported content: ${queuedItem.post.content}`
          };
        }
        return report;
      });
    }
  } catch (error) {
    // Ignore queue fetch errors
  }

  const query = filters.q?.trim().toLowerCase();

  if (!query) {
    return mapped;
  }

  return mapped.filter(
    (item) =>
      item.id.toLowerCase().includes(query) ||
      item.targetObjectId.toLowerCase().includes(query) ||
      item.reportedBy.toLowerCase().includes(query)
  );
}

export async function getReportById(id?: string): Promise<ReportItem | null> {
  if (!id) {
    const reports = await getReports();
    return reports[0] ?? null;
  }

  const response = await adminApiGet<ReportResponse>(`/api/v1/admin/reports/${id}`);

  if (!response) {
    const reports = await getReports();
    return reports[0] ?? null;
  }

  const reportItem = mapReport(response);

  // Dump the response for debugging
  try {
    const fs = require("fs");
    fs.writeFileSync("report-debug.json", JSON.stringify(response, null, 2));
  } catch (e) {}

  // If the content is still not available and we have a post_id, attempt to fetch the post to get its content.
  if (!response.post?.content && !response.content && !response.description && response.post_id) {
    try {
      // Try multiple possible endpoints for the post
      let postResponse = await adminApiGet<any>(`/api/v1/admin/posts/${response.post_id}`);
      if (!postResponse) {
        postResponse = await adminApiGet<any>(`/api/v1/posts/${response.post_id}`);
      }
      
      try {
        const fs = require("fs");
        fs.writeFileSync("post-debug.json", JSON.stringify(postResponse || { error: "No response" }, null, 2));
      } catch (e) {}

      // Handle standard API wrapper { data: { ... } } or direct response { content: "..." }
      const postData = postResponse?.data ?? postResponse;
      
      if (postData && postData.content) {
        reportItem.description = postData.content;
        reportItem.contextSummary = `Reported content: ${postData.content}`;
      } else if (postData && postData.post?.content) {
        reportItem.description = postData.post.content;
        reportItem.contextSummary = `Reported content: ${postData.post.content}`;
      } else {
         // Fallback to searching the moderation queue
         const queueResponse = await adminApiGet<any>(`/api/v1/admin/posts/moderation-queue`);
         const queuedItem = queueResponse?.data?.find((i: any) => i.post?.id === response.post_id);
         if (queuedItem && queuedItem.post?.content) {
            reportItem.description = queuedItem.post.content;
            reportItem.contextSummary = `Reported content (from queue): ${queuedItem.post.content}`;
         } else if (postData && Object.keys(postData).length > 0) {
            reportItem.contextSummary = `Target post found but content field missing. Structure: ${Object.keys(postData).join(", ")}`;
         }
      }
    } catch (error) {
      // Ignore errors if the post endpoint is not fully implemented
    }
  }

  return reportItem;
}

