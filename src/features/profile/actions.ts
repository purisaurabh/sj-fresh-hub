"use server";

import { revalidatePath } from "next/cache";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { assertActiveBuilding, profileUpdateSchema } from "@/features/auth/schemas";
import { requireCustomer } from "@/features/auth/session";

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Check the profile form.");
  }

  const { user, supabase } = await requireCustomer();
  const { data: building } = await supabase
    .from("buildings")
    .select("id, is_active")
    .eq("id", parsed.data.buildingId)
    .maybeSingle();

  try {
    assertActiveBuilding(building, parsed.data.buildingId);
  } catch {
    return actionError("We currently deliver only to selected buildings.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      building_id: parsed.data.buildingId,
    })
    .eq("id", user.id);

  if (error) {
    return actionError("Could not update your profile.");
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return actionSuccess("Profile updated.");
}
