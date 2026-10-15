"use server";

import { z } from "zod";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { getAuthContext } from "@/features/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { readVapidConfig } from "@/lib/push/env";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(8),
    auth: z.string().min(8),
  }),
});

export async function savePushSubscription(input: unknown): Promise<ActionResult> {
  if (!readVapidConfig()) {
    return actionError("Browser alerts are not configured on the server yet.");
  }
  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("That browser could not be registered for alerts.");
  }

  const { user } = await getAuthContext();
  if (!user) {
    return actionError("Sign in to receive browser alerts on this device.");
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    return actionError("Could not save browser alerts. Run the latest push SQL in Supabase, then try again.");
  }
  return actionSuccess("Browser alerts are on for this device.");
}

export async function deletePushSubscription(endpoint: string): Promise<ActionResult> {
  const parsed = z.string().url().safeParse(endpoint);
  if (!parsed.success) {
    return actionError("That browser alert subscription is not valid.");
  }
  const { user } = await getAuthContext();
  if (!user) {
    return actionSuccess();
  }
  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", parsed.data);
  if (error) {
    return actionError("Could not turn off browser alerts.");
  }
  return actionSuccess("Browser alerts are off for this device.");
}
