import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SavedAddress = {
  id: string;
  label: string | null;
  line1: string;
  landmark: string | null;
  pincode: string | null;
  building_id: string | null;
  building_name: string | null;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
};

export async function getMyAddresses(userId: string): Promise<SavedAddress[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("addresses")
    .select("id, label, line1, landmark, pincode, building_id, latitude, longitude, is_default, buildings(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const related = row.buildings;
    const buildingName = Array.isArray(related) ? related[0]?.name : related?.name;

    return {
      id: row.id,
      label: row.label,
      line1: row.line1,
      landmark: row.landmark,
      pincode: row.pincode,
      building_id: row.building_id,
      building_name: buildingName ?? null,
      latitude: row.latitude,
      longitude: row.longitude,
      is_default: row.is_default,
    };
  });
}
