"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { adminApiSend } from "@/lib/admin-api-server";

function buildRedirectPath(path: string, type: "success" | "error", message: string) {
  const [pathname, existingQuery] = path.split("?");
  const params = new URLSearchParams(existingQuery ?? "");
  params.set(type, message);
  return `${pathname}?${params.toString()}`;
}

function normalizeReturnPath(formData: FormData, fallback: string) {
  return (formData.get("returnPath")?.toString() || fallback).trim() || fallback;
}

export async function submitModerationAction(formData: FormData) {
  const postId = formData.get("postId")?.toString();
  const action = formData.get("action")?.toString();
  const note = formData.get("note")?.toString() || undefined;
  const returnPath = normalizeReturnPath(formData, "/admin/moderation");

  if (!postId || !action) {
    redirect(buildRedirectPath(returnPath, "error", "Missing moderation action context."));
  }

  if (action === "hide" || action === "block" || action === "restore") {
    const response = await adminApiSend<unknown>("POST", `/api/v1/admin/posts/${postId}/${action}`);

    if (!response.ok) {
      redirect(buildRedirectPath(returnPath, "error", `Moderation action failed (${response.status}).`));
    }

    revalidatePath("/admin");
    revalidatePath("/admin/moderation");
    redirect(buildRedirectPath(returnPath, "success", `Post action '${action}' applied.`));
  }

  const moderationMap: Record<
    string,
    { post_action?: string; user_action?: string; suspend_hours?: number }
  > = {
    approve: { post_action: "APPROVE" },
    sensitive: { post_action: "MARK_SENSITIVE" },
    reject: { post_action: "REJECT" },
    remove: { post_action: "REMOVE" },
    warn: { user_action: "WARN_USER" },
    temp_suspend: { user_action: "TEMP_SUSPEND", suspend_hours: 24 },
    permanent_suspend: { user_action: "PERMANENT_SUSPEND" }
  };

  const mapped = moderationMap[action];

  if (!mapped) {
    redirect(buildRedirectPath(returnPath, "error", "Unsupported moderation action."));
  }

  const response = await adminApiSend<unknown>(
    "POST",
    `/api/v1/admin/posts/${postId}/moderation-review`,
    {
      body: {
        ...mapped,
        note
      }
    }
  );

  if (!response.ok) {
    redirect(buildRedirectPath(returnPath, "error", `Moderation review failed (${response.status}).`));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/moderation");
  redirect(buildRedirectPath(returnPath, "success", "Moderation review submitted."));
}

export async function submitReportAction(formData: FormData) {
  const reportId = formData.get("reportId")?.toString();
  const action = formData.get("action")?.toString();
  const note = formData.get("note")?.toString() || undefined;
  const returnPath = normalizeReturnPath(formData, "/admin/reports");

  if (!reportId || !action) {
    redirect(buildRedirectPath(returnPath, "error", "Missing report action context."));
  }

  const directAction = action === "dismiss" ? "dismiss" : action === "action_taken" ? "action-taken" : null;

  if (directAction) {
    const response = await adminApiSend("POST", `/api/v1/admin/reports/${reportId}/${directAction}`);

    if (!response.ok) {
      redirect(buildRedirectPath(returnPath, "error", `Report action failed (${response.status}).`));
    }

    revalidatePath("/admin/reports");
    redirect(buildRedirectPath(returnPath, "success", "Report updated."));
  }

  if (action === "reviewed") {
    const response = await adminApiSend("POST", `/api/v1/admin/reports/${reportId}/review`, {
      body: {
        status: "REVIEWED",
        note
      }
    });

    if (!response.ok) {
      redirect(buildRedirectPath(returnPath, "error", `Report review failed (${response.status}).`));
    }

    revalidatePath("/admin/reports");
    redirect(buildRedirectPath(returnPath, "success", "Report marked reviewed."));
  }

  redirect(buildRedirectPath(returnPath, "error", "Unsupported report action."));
}

export async function submitUserStatusAction(formData: FormData) {
  const userId = formData.get("userId")?.toString();
  const status = formData.get("status")?.toString();
  const reason = formData.get("reason")?.toString() || undefined;
  const returnPath = normalizeReturnPath(formData, "/admin/users");

  if (!userId || !status) {
    redirect(buildRedirectPath(returnPath, "error", "Missing user status context."));
  }

  const response = await adminApiSend("PATCH", `/api/v1/admin/users/${userId}/status`, {
    body: {
      status,
      reason
    }
  });

  if (!response.ok) {
    redirect(buildRedirectPath(returnPath, "error", `Status update failed (${response.status}).`));
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect(buildRedirectPath(returnPath, "success", "User status updated."));
}

export async function submitUserRolesAction(formData: FormData) {
  const userId = formData.get("userId")?.toString();
  const roles = formData.getAll("roles").map(String).filter(Boolean);
  const returnPath = normalizeReturnPath(formData, "/admin/users");

  if (!userId || roles.length === 0) {
    redirect(buildRedirectPath(returnPath, "error", "Select at least one role."));
  }

  const response = await adminApiSend("PATCH", `/api/v1/admin/users/${userId}/roles`, {
    body: { roles }
  });

  if (!response.ok) {
    redirect(buildRedirectPath(returnPath, "error", `Role update failed (${response.status}).`));
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect(buildRedirectPath(returnPath, "success", "User roles updated."));
}

export async function submitWarnUserAction(formData: FormData) {
  const userId = formData.get("userId")?.toString();
  const count = formData.get("count")?.toString() || "1";
  const returnPath = normalizeReturnPath(formData, "/admin/users");

  if (!userId) {
    redirect(buildRedirectPath(returnPath, "error", "Missing user context."));
  }

  const response = await adminApiSend("POST", `/api/v1/admin/users/${userId}/warn`, {
    query: { count }
  });

  if (!response.ok) {
    redirect(buildRedirectPath(returnPath, "error", `Warn action failed (${response.status}).`));
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect(buildRedirectPath(returnPath, "success", "Warning issued."));
}

export async function submitSuspendUserAction(formData: FormData) {
  const userId = formData.get("userId")?.toString();
  const reason = formData.get("reason")?.toString();
  const permanent = formData.get("permanent")?.toString() === "true";
  const hoursValue = formData.get("hours")?.toString();
  const returnPath = normalizeReturnPath(formData, "/admin/users");

  if (!userId || !reason) {
    redirect(buildRedirectPath(returnPath, "error", "Suspension reason is required."));
  }

  const response = await adminApiSend("POST", `/api/v1/admin/users/${userId}/suspend`, {
    body: {
      reason,
      permanent,
      ...(permanent ? {} : { hours: hoursValue ? Number(hoursValue) : 24 })
    }
  });

  if (!response.ok) {
    redirect(buildRedirectPath(returnPath, "error", `Suspend action failed (${response.status}).`));
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect(buildRedirectPath(returnPath, "success", "User suspended."));
}

export async function submitUnsuspendUserAction(formData: FormData) {
  const userId = formData.get("userId")?.toString();
  const returnPath = normalizeReturnPath(formData, "/admin/users");

  if (!userId) {
    redirect(buildRedirectPath(returnPath, "error", "Missing user context."));
  }

  const response = await adminApiSend("POST", `/api/v1/admin/users/${userId}/unsuspend`);

  if (!response.ok) {
    redirect(buildRedirectPath(returnPath, "error", `Unsuspend action failed (${response.status}).`));
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect(buildRedirectPath(returnPath, "success", "User unsuspended."));
}

export async function submitConfigUpdate(formData: FormData) {
  const returnPath = normalizeReturnPath(formData, "/admin/config");
  const response = await adminApiSend("PATCH", "/api/v1/admin/config", {
    body: {
      registration_min_age: Number(formData.get("registration_min_age")),
      content_moderation_enabled: formData.get("content_moderation_enabled") === "on",
      content_moderation_provider: formData.get("content_moderation_provider")?.toString(),
      content_moderation_fail_open: formData.get("content_moderation_fail_open") === "on"
    }
  });

  if (!response.ok) {
    redirect(buildRedirectPath(returnPath, "error", `Config update failed (${response.status}).`));
  }

  revalidatePath("/admin/config");
  revalidatePath("/admin");
  redirect(buildRedirectPath(returnPath, "success", "Configuration updated."));
}

export async function submitPolicyCreate(formData: FormData) {
  const returnPath = normalizeReturnPath(formData, "/admin/policies");
  const response = await adminApiSend<{ id: string }>("POST", "/api/v1/admin/policies", {
    body: {
      policy_type: formData.get("policy_type")?.toString(),
      title: formData.get("title")?.toString(),
      content_markdown: formData.get("content_markdown")?.toString()
    }
  });

  if (!response.ok || !response.data?.id) {
    redirect(buildRedirectPath(returnPath, "error", `Policy creation failed (${response.status}).`));
  }

  revalidatePath("/admin/policies");
  redirect(buildRedirectPath(`/admin/policies/${response.data.id}`, "success", "Policy draft created."));
}

export async function submitPolicyUpdate(formData: FormData) {
  const policyId = formData.get("policyId")?.toString();
  const returnPath = normalizeReturnPath(formData, "/admin/policies");

  if (!policyId) {
    redirect(buildRedirectPath(returnPath, "error", "Missing policy context."));
  }

  const response = await adminApiSend("PATCH", `/api/v1/admin/policies/${policyId}`, {
    body: {
      title: formData.get("title")?.toString(),
      content_markdown: formData.get("content_markdown")?.toString()
    }
  });

  if (!response.ok) {
    redirect(buildRedirectPath(returnPath, "error", `Policy update failed (${response.status}).`));
  }

  revalidatePath("/admin/policies");
  revalidatePath(`/admin/policies/${policyId}`);
  redirect(buildRedirectPath(returnPath, "success", "Policy draft updated."));
}

export async function submitPolicyPublish(formData: FormData) {
  const policyId = formData.get("policyId")?.toString();
  const returnPath = normalizeReturnPath(formData, "/admin/policies");

  if (!policyId) {
    redirect(buildRedirectPath(returnPath, "error", "Missing policy context."));
  }

  const response = await adminApiSend("POST", `/api/v1/admin/policies/${policyId}/publish`, {
    body: {
      effective_at: null
    }
  });

  if (!response.ok) {
    redirect(buildRedirectPath(returnPath, "error", `Policy publish failed (${response.status}).`));
  }

  revalidatePath("/admin/policies");
  revalidatePath(`/admin/policies/${policyId}`);
  redirect(buildRedirectPath(returnPath, "success", "Policy published."));
}
