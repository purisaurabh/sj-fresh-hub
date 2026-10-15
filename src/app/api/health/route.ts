import { isSupabaseConfigured } from "@/lib/env";

export async function GET() {
  return Response.json({
    ok: true,
    service: "sj-fresh-hub",
    supabaseConfigured: isSupabaseConfigured(),
    serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
}
