export function safeNextPath(next: string | null | undefined): string | null {
  if (!next) {
    return null;
  }

  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://")) {
    return null;
  }
  if (trimmed.startsWith("/login") || trimmed.startsWith("/register") || trimmed.startsWith("/auth")) {
    return null;
  }

  return trimmed;
}

export function loginHref(next?: string | null): string {
  const safe = safeNextPath(next);
  if (!safe) {
    return "/login";
  }
  return `/login?next=${encodeURIComponent(safe)}`;
}

export function registerHref(next?: string | null): string {
  const safe = safeNextPath(next);
  if (!safe) {
    return "/register";
  }
  return `/register?next=${encodeURIComponent(safe)}`;
}
