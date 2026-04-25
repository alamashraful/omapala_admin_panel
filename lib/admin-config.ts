import { adminApiGet } from "@/lib/admin-api-server";

type AdminConfigResponse = {
  registration_min_age: number;
  content_moderation_enabled: boolean;
  content_moderation_provider: string;
  content_moderation_fail_open: boolean;
  app_version: string;
};

export async function getAdminConfig() {
  const response = await adminApiGet<AdminConfigResponse>("/api/v1/admin/config");

  return {
    registrationMinAge: response?.registration_min_age ?? 0,
    contentModerationEnabled: response?.content_moderation_enabled ?? false,
    contentModerationProvider: response?.content_moderation_provider ?? "Unknown",
    contentModerationFailOpen: response?.content_moderation_fail_open ?? false,
    appVersion: response?.app_version ?? "Unknown"
  };
}

