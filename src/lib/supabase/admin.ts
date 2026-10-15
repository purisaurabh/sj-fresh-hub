import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { requirePublicEnv, requireServiceRoleKey } from "@/lib/env";

export function createAdminSupabaseClient() {
  const env = requirePublicEnv();

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, requireServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
