import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { fallbackSettings, type PublicSettings } from "@/features/products/queries";

export async function getPublicSettings(): Promise<PublicSettings> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return fallbackSettings;
  }

  const { data } = await supabase
    .from("settings")
    .select(
      "shop_name, shop_phone, announcement_text, delivery_area_text, is_open, delivery_fee, minimum_order, low_stock_threshold",
    )
    .eq("id", 1)
    .maybeSingle();

  return data ?? fallbackSettings;
}
