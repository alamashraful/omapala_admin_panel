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

  return {
    id: item.id,
    targetType,
    targetObjectId,
    reason: startCase(item.reason),
    description: "The current reports API does not expose report descriptions yet.",
    status: startCase(item.status),
    tone: mapReportTone(item.status),
    reportedBy: item.reported_by,
    createdAt: formatDateTime(item.created_at),
    reviewedBy: "Not exposed by API yet",
    reviewedAt: "Not exposed by API yet",
    reporterProfile: "Reporter profile details are not included in the current admin report response.",
    contextSummary: `${targetType} target ${targetObjectId}. Additional target context is not exposed by the current API.`,
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

  const mapped = (response?.data ?? []).map(mapReport);
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

  return mapReport(response);
}

