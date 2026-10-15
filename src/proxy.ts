import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseSessionCookie, updateSession } from "@/lib/supabase/proxy";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
  return to;
}

function redirectToLogin(request: NextRequest, response?: NextResponse) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  const redirectResponse = NextResponse.redirect(loginUrl);
  return response ? copyCookies(response, redirectResponse) : redirectResponse;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === "/admin/login" || path === "/forgot-password" || path === "/reset-password") {
    return redirectToLogin(request);
  }

  const needsAdminGuard = path.startsWith("/admin");
  if (needsAdminGuard && !hasSupabaseSessionCookie(request)) {
    return redirectToLogin(request);
  }

  const { response, user } = await updateSession(request);

  if (needsAdminGuard && !user) {
    return redirectToLogin(request, response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
