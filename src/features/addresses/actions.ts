"use server";

import { revalidatePath } from "next/cache";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { addressSchema } from "@/features/addresses/schemas";
import { assertActiveBuilding } from "@/features/auth/schemas";
import { requireCustomer } from "@/features/auth/session";

async function revalidateAddresses() {
  revalidatePath("/addresses");
  revalidatePath("/profile");
  revalidatePath("/checkout");
}

export async function createAddress(input: unknown): Promise<ActionResult> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Check the address form.");
  }

  const { user, supabase } = await requireCustomer();
  const { data: building } = await supabase
    .from("buildings")
    .select("id, is_active, latitude, longitude")
    .eq("id", parsed.data.buildingId)
    .maybeSingle();

  let activeBuilding;
  try {
    activeBuilding = assertActiveBuilding(building, parsed.data.buildingId);
  } catch {
    return actionError("We currently deliver only to selected buildings.");
  }

  const { count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const isDefault = parsed.data.isDefault ?? (count ?? 0) === 0;

  if (isDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      label: parsed.data.label ?? null,
      line1: parsed.data.line1,
      building_id: parsed.data.buildingId,
      landmark: parsed.data.landmark ?? null,
      pincode: parsed.data.pincode ?? null,
      latitude: parsed.data.latitude ?? activeBuilding.latitude,
      longitude: parsed.data.longitude ?? activeBuilding.longitude,
      is_default: isDefault,
    })
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return actionError("Could not save the address.");
  }

  await revalidateAddresses();
  return actionSuccess("Address saved.");
}

export async function updateAddress(addressId: string, input: unknown): Promise<ActionResult> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Check the address form.");
  }

  const { user, supabase } = await requireCustomer();
  const { data: building } = await supabase
    .from("buildings")
    .select("id, is_active, latitude, longitude")
    .eq("id", parsed.data.buildingId)
    .maybeSingle();

  let activeBuilding;
  try {
    activeBuilding = assertActiveBuilding(building, parsed.data.buildingId);
  } catch {
    return actionError("We currently deliver only to selected buildings.");
  }

  if (parsed.data.isDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const { data, error } = await supabase
    .from("addresses")
    .update({
      label: parsed.data.label ?? null,
      line1: parsed.data.line1,
      building_id: parsed.data.buildingId,
      landmark: parsed.data.landmark ?? null,
      pincode: parsed.data.pincode ?? null,
      latitude: parsed.data.latitude ?? activeBuilding.latitude,
      longitude: parsed.data.longitude ?? activeBuilding.longitude,
      is_default: parsed.data.isDefault ?? false,
    })
    .eq("id", addressId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return actionError("Could not update the address.");
  }

  await revalidateAddresses();
  return actionSuccess("Address updated.");
}

export async function deleteAddress(addressId: string): Promise<ActionResult> {
  const { user, supabase } = await requireCustomer();
  const { error } = await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", user.id);

  if (error) {
    return actionError("Could not remove the address.");
  }

  await revalidateAddresses();
  return actionSuccess("Address removed.");
}
