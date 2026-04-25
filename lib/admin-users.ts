import { adminApiGet } from "@/lib/admin-api-server";
import { formatDateTime, formatNumber } from "@/lib/format";

type AdminUserListItemResponse = {
  id: string;
  email?: string | null;
  phone?: string | null;
  display_name?: string | null;
  handler?: string | null;
  status: string;
  roles: string[];
  email_verified: boolean;
  phone_verified: boolean;
  moderation_warning_count: number;
  suspended_until?: string | null;
  created_at: string;
  updated_at?: string | null;
};

type AdminUserDetailResponse = AdminUserListItemResponse & {
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
  location?: string | null;
  gender?: string | null;
  avatar_url?: string | null;
  agreed_to_terms: boolean;
  agreed_to_terms_at?: string | null;
  password_changed_at?: string | null;
  suspension_reason?: string | null;
};

type AdminUserListResponse = {
  data: AdminUserListItemResponse[];
  total: number;
};

type AnalyticsUsersResponse = {
  total_users: number;
  suspended_users: number;
  warned_users: number;
  new_users: { today: number };
};

export type UserRecord = {
  id: string;
  displayName: string;
  email: string;
  handler: string;
  status: "Active" | "Warned" | "Suspended";
  statusTone: "success" | "warning" | "danger";
  roles: string[];
  emailVerified: boolean;
  phoneVerified: boolean;
  warningCount: number;
  suspendedUntil?: string;
  createdAt: string;
  updatedAt: string;
};

type UserFilters = {
  status?: string;
  role?: string;
  q?: string;
  limit?: number;
  offset?: number;
};

function mapStatus(status: string, warningCount: number): UserRecord["status"] {
  if (status === "SUSPENDED") {
    return "Suspended";
  }

  if (warningCount > 0) {
    return "Warned";
  }

  return "Active";
}

function mapStatusTone(status: UserRecord["status"]) {
  if (status === "Suspended") {
    return "danger" as const;
  }

  if (status === "Warned") {
    return "warning" as const;
  }

  return "success" as const;
}

function mapUser(item: AdminUserListItemResponse): UserRecord {
  const mappedStatus = mapStatus(item.status, item.moderation_warning_count);

  return {
    id: item.id,
    displayName: item.display_name ?? "Unnamed user",
    email: item.email ?? "No email",
    handler: item.handler ? `@${item.handler}` : "No handler",
    status: mappedStatus,
    statusTone: mapStatusTone(mappedStatus),
    roles: item.roles,
    emailVerified: item.email_verified,
    phoneVerified: item.phone_verified,
    warningCount: item.moderation_warning_count,
    suspendedUntil: item.suspended_until ? formatDateTime(item.suspended_until) : undefined,
    createdAt: formatDateTime(item.created_at),
    updatedAt: item.updated_at ? formatDateTime(item.updated_at) : "Not updated yet"
  };
}

export async function getUsers(filters: UserFilters = {}): Promise<UserRecord[]> {
  const response = await adminApiGet<AdminUserListResponse>("/api/v1/admin/users", {
    query: {
      q: filters.q,
      ...(filters.status && filters.status !== "All"
        ? { status: filters.status.toUpperCase() === "WARNED" ? "ACTIVE" : filters.status.toUpperCase() }
        : {}),
      ...(filters.role && filters.role !== "All" ? { role: filters.role } : {}),
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0
    }
  });

  const mapped = (response?.data ?? []).map(mapUser);

  if (filters.status === "Warned") {
    return mapped.filter((user) => user.warningCount > 0 && user.status !== "Suspended");
  }

  return mapped;
}

export async function getUserSummary() {
  const [analytics, users] = await Promise.all([
    adminApiGet<AnalyticsUsersResponse>("/api/v1/admin/analytics/users"),
    adminApiGet<AdminUserListResponse>("/api/v1/admin/users", { query: { limit: 200, offset: 0 } })
  ]);

  const moderatorCount =
    users?.data.filter((user) => user.roles.includes("POST_MODERATOR") || user.roles.includes("ADMIN"))
      .length ?? 0;

  return {
    totalUsers: formatNumber(analytics?.total_users ?? users?.total ?? 0),
    suspendedUsers: formatNumber(analytics?.suspended_users ?? 0),
    moderators: formatNumber(moderatorCount),
    newToday: formatNumber(analytics?.new_users.today ?? 0)
  };
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const response = await adminApiGet<AdminUserDetailResponse>(`/api/v1/admin/users/${id}`);
  return response ? mapUser(response) : null;
}

export async function getUserDetail(id: string) {
  const response = await adminApiGet<AdminUserDetailResponse>(`/api/v1/admin/users/${id}`);

  if (!response) {
    return null;
  }

  const base = mapUser(response);

  return {
    ...base,
    phone: response.phone ?? "No phone",
    firstName: response.first_name ?? "Not provided",
    lastName: response.last_name ?? "Not provided",
    bio: response.bio ?? "No bio provided.",
    location: response.location ?? "Not provided",
    gender: response.gender ?? "Not provided",
    avatarLabel: response.avatar_url ?? "No avatar",
    agreedToTerms: response.agreed_to_terms,
    agreedToTermsAt: response.agreed_to_terms_at
      ? formatDateTime(response.agreed_to_terms_at)
      : "Not recorded",
    passwordChangedAt: response.password_changed_at
      ? formatDateTime(response.password_changed_at)
      : "Not recorded",
    suspensionReason: response.suspension_reason ?? "No active suspension reason recorded.",
    moderationHistory: [
      `Moderation warnings: ${response.moderation_warning_count}`,
      `Account status: ${response.status}`,
      `Suspended until: ${response.suspended_until ? formatDateTime(response.suspended_until) : "Not suspended"}`
    ],
    enforcementLog: [
      {
        date: base.updatedAt,
        action: "Latest account update",
        actor: "Not exposed by API yet"
      },
      {
        date: base.createdAt,
        action: "Account created",
        actor: "System"
      }
    ]
  };
}
