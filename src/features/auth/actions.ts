"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { normalizePhone } from "@/lib/auth/phone";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { assertActiveBuilding, loginSchema, registerSchema } from "@/features/auth/schemas";
import {
  createAuthUserForPhone,
  homePathForRole,
  signInWithPhonePassword,
} from "@/features/auth/session";
import { safeNextPath } from "@/lib/auth/next-path";

async function requireActiveBuilding(buildingId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: building } = await supabase
    .from("buildings")
    .select("id, is_active")
    .eq("id", buildingId)
    .maybeSingle();

  return assertActiveBuilding(building, buildingId);
}

function nextFromInput(input: unknown): string | null {
  if (!input || typeof input !== "object" || !("next" in input)) {
    return null;
  }
  const value = (input as { next?: unknown }).next;
  return typeof value === "string" ? safeNextPath(value) : null;
}

function redirectAfterAuth(role: string | null | undefined, next: string | null): never {
  if (next && role !== "admin") {
    redirect(next);
  }
  if (next && role === "admin" && next.startsWith("/admin")) {
    redirect(next);
  }
  redirect(homePathForRole(role));
}

export async function registerUser(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Check the registration form.");
  }

  const phone = normalizePhone(parsed.data.phone);

  try {
    await requireActiveBuilding(parsed.data.buildingId);
  } catch {
    return actionError("We currently deliver only to selected buildings.");
  }

  const admin = createAdminSupabaseClient();
  const { data: existing } = await admin.from("profiles").select("id").eq("phone", phone).maybeSingle();
  if (existing) {
    return actionError("This mobile number is already registered. Please log in.");
  }

  try {
    const user = await createAuthUserForPhone(phone, parsed.data.password);
    const { error: profileError } = await admin.from("profiles").insert({
      id: user.id,
      full_name: parsed.data.fullName,
      phone,
      building_id: parsed.data.buildingId,
      role: "customer",
    });
    if (profileError) {
      await admin.auth.admin.deleteUser(user.id);
      return actionError("Could not create the profile. Please try again.");
    }
    await signInWithPhonePassword(phone, parsed.data.password);
  } catch {
    return actionError("Could not complete registration. Please try again.");
  }

  revalidatePath("/", "layout");
  redirectAfterAuth("customer", nextFromInput(input));
}

export async function loginUser(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Enter your mobile number and password.");
  }

  const phone = normalizePhone(parsed.data.phone);
  let profile;

  try {
    profile = await signInWithPhonePassword(phone, parsed.data.password);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not log you in. Please try again.";
    return actionError(message);
  }

  revalidatePath("/", "layout");
  redirectAfterAuth(profile.role, nextFromInput(input));
}

export async function logoutUser(): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return actionError("Could not log you out. Please try again.");
  }
  revalidatePath("/", "layout");
  return actionSuccess("Logged out successfully");
}
