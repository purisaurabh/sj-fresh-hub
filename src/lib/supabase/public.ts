import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { readPublicEnv } from "@/lib/env";

export function createPublicSupabaseClient() {
  const env = readPublicEnv();
  if (!env) {
    return null;
  }

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
