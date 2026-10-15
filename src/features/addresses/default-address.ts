import { requireCustomer } from "@/features/auth/session";

export async function ensureDefaultDeliveryAddress(buildingId: string | null) {
  const { user, supabase } = await requireCustomer();
  const { count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) > 0 || !buildingId) {
    return;
  }

  const { data: building } = await supabase
    .from("buildings")
    .select("id, name, address, landmark, latitude, longitude, is_active")
    .eq("id", buildingId)
    .maybeSingle();

  if (!building || !building.is_active) {
    return;
  }

  await supabase.from("addresses").insert({
    user_id: user.id,
    label: "Home",
    line1: building.address ?? building.name,
    building_id: building.id,
    landmark: building.landmark,
    latitude: building.latitude,
    longitude: building.longitude,
    is_default: true,
  });
}
