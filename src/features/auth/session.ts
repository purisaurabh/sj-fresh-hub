import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { loginHref } from "@/lib/auth/next-path";
import { toInternalEmail } from "@/lib/auth/phone";
import { requestPath } from "@/lib/auth/request-path";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { listHasSupabaseAuthCookie } from "@/lib/supabase/session-cookie";
import { type Tables } from "@/types/database.types";

export type Profile = Pick<
  Tables<"profiles">,
  "id" | "full_name" | "phone" | "role" | "building_id"
>;

export const getAuthContext = cache(async () => {
  const cookieStore = await cookies();
  if (!listHasSupabaseAuthCookie(cookieStore.getAll())) {
    return { supabase: await createServerSupabaseClient(), user: null, profile: null };
  }

  await connection();
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, building_id")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, profile };
});

export async function createAuthUserForPhone(phone: string, password: string) {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: toInternalEmail(phone),
    password,
    email_confirm: true,
    user_metadata: { phone },
  });
  if (error || !data.user) {
    throw new Error("Could not create the account.");
  }
  return data.user;
}

export async function signInWithPhonePassword(phone: string, password: string) {
  const admin = createAdminSupabaseClient();
  const { data: profile } = await admin.from("profiles").select("id, role").eq("phone", phone).maybeSingle();
  if (!profile) {
    throw new Error("No account found for this mobile number. Please register.");
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(profile.id);
  const email = userData.user?.email;
  if (userError || !email) {
    throw new Error("Could not log you in. Please try again.");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error("Mobile number or password is incorrect.");
  }

  return profile;
}

export async function requireUser() {
  const context = await getAuthContext();
  if (!context.user) {
    redirect(loginHref(await requestPath()));
  }
  return context;
}

export async function requireCustomer() {
  const context = await requireUser();
  if (context.profile?.role === "admin") {
    redirect("/admin/orders");
  }
  return context;
}

export async function requireAdmin() {
  const context = await getAuthContext();
  if (!context.user) {
    redirect(loginHref(await requestPath()));
  }
  if (context.profile?.role !== "admin") {
    redirect("/");
  }
  return context;
}

export function homePathForRole(role: string | null | undefined): string {
  return role === "admin" ? "/admin/orders" : "/";
}
