import { isSupabaseConfigured } from "@/lib/env";

export async function GET() {
  return Response.json({
    ok: true,
    service: "sj-fresh-hub",
    supabaseConfigured: isSupabaseConfigured(),
    serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    vapidConfigured: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
  });
}
