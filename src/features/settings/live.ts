import { connection } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CheckoutSettings = {
  isOpen: boolean;
  deliveryFee: number;
  minimumOrder: number;
  shopPhone: string | null;
};

export async function getCheckoutSettings(): Promise<CheckoutSettings> {
  await connection();
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("settings")
    .select("is_open, delivery_fee, minimum_order, shop_phone")
    .eq("id", 1)
    .maybeSingle();

  return {
    isOpen: data?.is_open ?? false,
    deliveryFee: Number(data?.delivery_fee ?? 0),
    minimumOrder: Number(data?.minimum_order ?? 0),
    shopPhone: data?.shop_phone ?? null,
  };
}
