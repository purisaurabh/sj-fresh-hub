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
  const { data, error } = await supabase
    .from("addresses")
    .select("id, label, line1, landmark, pincode, building_id, latitude, longitude, is_default")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const buildingIds = [...new Set(data.map((row) => row.building_id).filter((id): id is string => Boolean(id)))];
  const names = new Map<string, string>();
  if (buildingIds.length > 0) {
    const { data: buildings } = await supabase.from("buildings").select("id, name").in("id", buildingIds);
    for (const building of buildings ?? []) {
      names.set(building.id, building.name);
    }
  }

  return data.map((row) => ({
    id: row.id,
    label: row.label,
    line1: row.line1,
    landmark: row.landmark,
    pincode: row.pincode,
    building_id: row.building_id,
    building_name: row.building_id ? (names.get(row.building_id) ?? null) : null,
    latitude: row.latitude,
    longitude: row.longitude,
    is_default: row.is_default,
  }));
}
