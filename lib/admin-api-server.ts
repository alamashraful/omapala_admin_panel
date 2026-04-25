import { cookies } from "next/headers";

type RequestOptions = {
  query?: Record<string, string | number | boolean | undefined>;
  init?: RequestInit;
};

type CachedToken = {
  token: string;
  expiresAt: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(path, API_BASE_URL);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

async function getAccessToken() {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("omapala_access_token")?.value;

  if (cookieToken) {
    return cookieToken;
  }

  if (process.env.OMAPALA_ADMIN_ACCESS_TOKEN) {
    return process.env.OMAPALA_ADMIN_ACCESS_TOKEN;
  }

  return null;
}

export async function adminApiGet<T>(path: string, options: RequestOptions = {}) {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }

  const response = await fetch(buildUrl(path, options.query), {
    ...options.init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

export async function adminApiSend<T>(
  method: "POST" | "PATCH",
  path: string,
  options: RequestOptions & { body?: unknown } = {}
) {
  const token = await getAccessToken();

  if (!token) {
    return { ok: false, status: 401, data: null as T | null };
  }

  const response = await fetch(buildUrl(path, options.query), {
    method,
    ...options.init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.init?.headers ?? {})
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store"
  });

  if (response.status === 204) {
    return { ok: response.ok, status: response.status, data: null as T | null };
  }

  let data: T | null = null;

  try {
    data = (await response.json()) as T;
  } catch {
    data = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  };
}
