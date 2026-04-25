"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { hasAdminAccessFromToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

type LoginResponse = {
  access_token: string;
  expires_in: number;
};

function buildLoginRedirect(type: "error" | "success", message: string, redirectTo?: string) {
  const params = new URLSearchParams();
  params.set(type, message);

  if (redirectTo && redirectTo.startsWith("/")) {
    params.set("redirectTo", redirectTo);
  }

  return `/?${params.toString()}`;
}

export async function submitAdminLogin(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const redirectTo = formData.get("redirectTo")?.toString();

  if (!email || !password) {
    redirect(buildLoginRedirect("error", "Email and password are required.", redirectTo));
  }

  const response = await fetch(new URL("/api/v1/auth/login", API_BASE_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store"
  });

  if (!response.ok) {
    redirect(buildLoginRedirect("error", "Login failed. Check your credentials.", redirectTo));
  }

  const payload = (await response.json()) as LoginResponse;

  if (!hasAdminAccessFromToken(payload.access_token)) {
    redirect(buildLoginRedirect("error", "This account does not have admin access.", redirectTo));
  }

  const cookieStore = await cookies();
  cookieStore.set("omapala_access_token", payload.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: payload.expires_in
  });

  redirect(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/admin");
}

export async function submitAdminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("omapala_access_token");
  redirect("/?success=Signed%20out%20successfully.");
}
