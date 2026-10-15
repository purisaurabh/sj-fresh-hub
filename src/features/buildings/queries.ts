import { cacheLife, cacheTag } from "next/cache";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export type ActiveBuilding = {
  id: string;
  name: string;
  address: string | null;
  landmark: string | null;
};

export async function getActiveBuildings(): Promise<ActiveBuilding[]> {
  "use cache";
  cacheTag("buildings");
  cacheLife("hours");

  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("active_buildings")
    .select("id, name, address, landmark")
    .order("name", { ascending: true });

  return (data ?? []).filter((building): building is ActiveBuilding => Boolean(building.id && building.name));
}
