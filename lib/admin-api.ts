type ApiClientOptions = {
  baseUrl?: string;
  token?: string;
};

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
};

export class AdminApiClient {
  private readonly baseUrl: string;
  private readonly token?: string;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl =
      options.baseUrl ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:8000";
    this.token = options.token;
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  async post<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST" });
  }

  async patch<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "PATCH" });
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(path, this.baseUrl);

    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...(options.headers ?? {})
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Admin API request failed: ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}

export const adminApi = new AdminApiClient();

