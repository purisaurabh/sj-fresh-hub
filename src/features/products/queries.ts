import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { StorefrontProduct } from "@/features/products/types";
import { searchScore } from "@/lib/search";

export type PublicSettings = {
  shop_name: string;
  shop_phone: string | null;
  announcement_text: string;
  delivery_area_text: string;
  is_open: boolean;
  delivery_fee: number;
  minimum_order: number;
  low_stock_threshold: number;
};

export type CatalogPayload = {
  configured: boolean;
  settings: PublicSettings | null;
  categories: { id: string; name: string; slug: string }[];
  products: StorefrontProduct[];
};

export const fallbackSettings: PublicSettings = {
  shop_name: "SJ Fresh Hub",
  shop_phone: null,
  announcement_text: "SJ Fresh Hub • Fresh Healthy Tasty Vegetables & Fruits",
  delivery_area_text: "Home Delivery in Selected Buildings",
  is_open: true,
  delivery_fee: 0,
  minimum_order: 0,
  low_stock_threshold: 5,
};

export async function getPublicCatalog(query?: string): Promise<CatalogPayload> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return {
      configured: false,
      settings: fallbackSettings,
      categories: [],
      products: [],
    };
  }

  const [settingsResult, categoriesResult, productsResult] = await Promise.all([
    supabase
      .from("settings")
      .select(
        "shop_name, shop_phone, announcement_text, delivery_area_text, is_open, delivery_fee, minimum_order, low_stock_threshold",
      )
      .eq("id", 1)
      .maybeSingle(),
    supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("catalog_products")
      .select(
        "id, category_id, category_name, name, slug, image_url, unit, quantity_step, price, stock_quantity, status",
      )
      .order("name", { ascending: true }),
  ]);

  const products = (productsResult.data ?? [])
    .map((product) => ({
      product,
      score: searchScore({ name: product.name ?? "", categoryName: product.category_name }, query ?? ""),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product)
    .filter((product) => Boolean(product.id && product.name && product.slug && product.unit))
    .map((product) => ({
      id: product.id as string,
      name: product.name as string,
      slug: product.slug as string,
      categoryId: product.category_id,
      categoryName: product.category_name,
      imageUrl: product.image_url,
      unit: product.unit as string,
      quantityStep: Number(product.quantity_step ?? 1),
      price: Number(product.price ?? 0),
      stockQuantity: Number(product.stock_quantity ?? 0),
      status: product.status ?? "active",
    }));

  return {
    configured: true,
    settings: settingsResult.data ?? fallbackSettings,
    categories: categoriesResult.data ?? [],
    products,
  };
}
