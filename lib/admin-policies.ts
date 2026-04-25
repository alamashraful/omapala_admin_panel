import { adminApiGet } from "@/lib/admin-api-server";
import { formatDateTime } from "@/lib/format";

type PolicyType =
  | "PRIVACY_POLICY"
  | "TERMS_OF_SERVICE"
  | "COMMUNITY_GUIDELINES"
  | "AGE_VERIFICATION_POLICY";

type AdminPolicyListItemResponse = {
  id: string;
  policy_type: PolicyType;
  version: number;
  title: string;
  is_published: boolean;
  is_current: boolean;
  published_at?: string | null;
  effective_at?: string | null;
  created_at: string;
  updated_at?: string | null;
};

type AdminPolicyDetailResponse = AdminPolicyListItemResponse & {
  content_markdown: string;
  published_by?: string | null;
};

type AdminPolicyListResponse = {
  data: AdminPolicyListItemResponse[];
};

export type PolicyRecord = {
  id: string;
  policyType: PolicyType;
  version: string;
  title: string;
  isPublished: boolean;
  isCurrent: boolean;
  publishedAt?: string;
  effectiveAt: string;
  createdAt: string;
  updatedAt: string;
  statusTone: "success" | "warning" | "review" | "info";
  contentMarkdown: string;
  publishedBy?: string;
  draftSummary?: string;
};

function mapTone(item: { is_current: boolean; is_published: boolean }) {
  if (item.is_current) {
    return "success" as const;
  }

  if (!item.is_published) {
    return "warning" as const;
  }

  return "info" as const;
}

function mapListItem(item: AdminPolicyListItemResponse): PolicyRecord {
  return {
    id: item.id,
    policyType: item.policy_type,
    version: String(item.version),
    title: item.title,
    isPublished: item.is_published,
    isCurrent: item.is_current,
    publishedAt: item.published_at ? formatDateTime(item.published_at) : undefined,
    effectiveAt: item.effective_at ? formatDateTime(item.effective_at) : "Pending publish",
    createdAt: formatDateTime(item.created_at),
    updatedAt: item.updated_at ? formatDateTime(item.updated_at) : "Not updated yet",
    statusTone: mapTone(item),
    contentMarkdown: "Load the detail page to view policy markdown.",
    draftSummary: !item.is_published
      ? "Draft metadata is available, but summary text is not exposed by the current API."
      : undefined
  };
}

export async function getPolicies() {
  const response = await adminApiGet<AdminPolicyListResponse>("/api/v1/admin/policies");
  return (response?.data ?? []).map(mapListItem);
}

export async function getPolicyById(id: string): Promise<PolicyRecord | null> {
  const response = await adminApiGet<AdminPolicyDetailResponse>(`/api/v1/admin/policies/${id}`);

  if (!response) {
    return null;
  }

  return {
    id: response.id,
    policyType: response.policy_type,
    version: String(response.version),
    title: response.title,
    isPublished: response.is_published,
    isCurrent: response.is_current,
    publishedAt: response.published_at ? formatDateTime(response.published_at) : undefined,
    effectiveAt: response.effective_at ? formatDateTime(response.effective_at) : "Pending publish",
    createdAt: formatDateTime(response.created_at),
    updatedAt: response.updated_at ? formatDateTime(response.updated_at) : "Not updated yet",
    statusTone: mapTone(response),
    contentMarkdown: response.content_markdown,
    publishedBy: response.published_by ?? undefined,
    draftSummary: !response.is_published
      ? "This draft has not been published yet."
      : undefined
  };
}

export async function getPolicySummary() {
  const policies = await getPolicies();
  const recentActivity = policies.slice(0, 3).map((policy) => ({
    label: `${policy.title} v${policy.version}`,
    when: policy.updatedAt
  }));

  return {
    recentActivity,
    pendingApproval:
      policies.some((policy) => !policy.isPublished)
        ? "Draft policies exist and are pending publish."
        : "No draft policies currently pending publish."
  };
}
