const ADMIN_ROLES = new Set(["ADMIN"]);

type JwtPayload = {
  role?: string;
  roles?: string[];
};

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );
    const decodedString =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8");
    const decoded = JSON.parse(decodedString);
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}

export function extractRoles(payload: JwtPayload | null): string[] {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload.roles)) {
    return payload.roles;
  }

  if (payload.role) {
    return [payload.role];
  }

  return [];
}

export function hasAdminAccessFromToken(token: string): boolean {
  const payload = decodeJwtPayload(token);
  const roles = extractRoles(payload);
  return roles.some((role) => ADMIN_ROLES.has(role));
}
