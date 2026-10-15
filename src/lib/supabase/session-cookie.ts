export function isSupabaseAuthCookieName(name: string) {
  return /auth-token(?:\.\d+)?$/.test(name);
}

export function listHasSupabaseAuthCookie(cookies: { name: string }[]) {
  return cookies.some((cookie) => isSupabaseAuthCookieName(cookie.name));
}
