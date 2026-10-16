import { connection } from "next/server";
import { requireAdmin } from "@/features/auth/session";
import { sortOrdersNewestFirst } from "@/features/orders/sort";
import { isOrderStatus } from "@/features/orders/status";
import { isBuildingId } from "@/features/admin/orders-filter";
import { ADMIN_ORDERS_PAGE_SIZE, LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { endOfShopDayIso, isIsoDateOnly, startOfShopDayIso, todayInShopTz } from "@/lib/datetime";
import type { Json } from "@/types/database.types";

export type AdminOrderRow = {
  id: string;
  order_no: string;
  status: string;
  payment_status: string;
  total: number;
  building_name_snapshot: string;
  created_at: string;
  customer_name: string;
  customer_phone: string | null;
};

export type AdminOrderDetail = AdminOrderRow & {
  subtotal: number;
  delivery_fee: number;
  customer_note: string | null;
  address_snapshot: Json;
  items: {
    id: string;
    product_name_snapshot: string;
    unit_snapshot: string;
    unit_price_snapshot: number;
    quantity: number;
    line_total: number;
  }[];
  history: {
    id: string;
    old_status: string | null;
    new_status: string;
    note: string | null;
    created_at: string;
  }[];
};

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  category_name: string | null;
  image_url: string | null;
  unit: string;
  quantity_step: number;
  price: number;
  stock_quantity: number;
  status: string;
  description: string | null;
};

async function adminDb() {
  await connection();
  return requireAdmin();
}

export async function getAdminOverviewCounts() {
  const { supabase } = await adminDb();
  const [placed, today, settings, outOfStock] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "placed"),
    supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", startOfShopDayIso(todayInShopTz())),
    supabase.from("settings").select("low_stock_threshold").eq("id", 1).maybeSingle(),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active").lte("stock_quantity", 0),
  ]);

  const threshold = Number(settings.data?.low_stock_threshold ?? LOW_STOCK_THRESHOLD);
  const { count: lowCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .gt("stock_quantity", 0)
    .lte("stock_quantity", threshold);

  return {
    placedCount: placed.count ?? 0,
    todayCount: today.count ?? 0,
    lowStockCount: lowCount ?? 0,
    outOfStockCount: outOfStock.count ?? 0,
  };
}

export async function getAdminOrders(
  filters: {
    status?: string;
    building?: string;
    from?: string;
    to?: string;
    q?: string;
    page?: number;
  } = {},
): Promise<{ orders: AdminOrderRow[]; total: number; page: number; pageSize: number }> {
  const { supabase } = await adminDb();
  const pageSize = ADMIN_ORDERS_PAGE_SIZE;
  const page = Math.max(1, filters.page ?? 1);
  const fromIndex = (page - 1) * pageSize;
  let query = supabase
    .from("orders")
    .select("id, order_no, status, payment_status, total, building_name_snapshot, created_at, user_id", { count: "exact" });

  if (filters.status && isOrderStatus(filters.status)) {
    query = query.eq("status", filters.status);
  }

  if (isBuildingId(filters.building)) {
    const { data: building } = await supabase.from("buildings").select("name").eq("id", filters.building).maybeSingle();
    if (!building?.name) {
      return { orders: [], total: 0, page, pageSize };
    }
    query = query.eq("building_name_snapshot", building.name);
  }

  if (isIsoDateOnly(filters.from)) {
    query = query.gte("created_at", startOfShopDayIso(filters.from));
  }

  if (isIsoDateOnly(filters.to)) {
    query = query.lte("created_at", endOfShopDayIso(filters.to));
  }

  const search = filters.q?.trim();
  if (search) {
    query = query.ilike("order_no", `%${search}%`);
  }

  const { data: orders, count } = await query
    .order("created_at", { ascending: false })
    .order("order_no", { ascending: false })
    .range(fromIndex, fromIndex + pageSize - 1);
  const rows = sortOrdersNewestFirst(orders ?? []);
  const profileIds = [...new Set(rows.map((order) => order.user_id))];
  const { data: profiles } = profileIds.length
    ? await supabase.from("profiles").select("id, full_name, phone").in("id", profileIds)
    : { data: [] };
  const byId = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return {
    total: count ?? 0,
    page,
    pageSize,
    orders: rows.map((order) => ({
      id: order.id,
      order_no: order.order_no,
      status: order.status,
      payment_status: order.payment_status,
      total: Number(order.total),
      building_name_snapshot: order.building_name_snapshot,
      created_at: order.created_at,
      customer_name: byId.get(order.user_id)?.full_name ?? "Customer",
      customer_phone: byId.get(order.user_id)?.phone ?? null,
    })),
  };
}

export async function getAdminOrder(orderId: string): Promise<AdminOrderDetail | null> {
  const { supabase } = await adminDb();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_no, status, payment_status, total, subtotal, delivery_fee, building_name_snapshot, created_at, user_id, customer_note, address_snapshot",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return null;
  }

  const [{ data: profile }, { data: items }, { data: history }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", order.user_id).maybeSingle(),
    supabase
      .from("order_items")
      .select("id, product_name_snapshot, unit_snapshot, unit_price_snapshot, quantity, line_total")
      .eq("order_id", order.id),
    supabase
      .from("order_status_history")
      .select("id, old_status, new_status, note, created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true }),
  ]);

  return {
    id: order.id,
    order_no: order.order_no,
    status: order.status,
    payment_status: order.payment_status,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    delivery_fee: Number(order.delivery_fee),
    building_name_snapshot: order.building_name_snapshot,
    created_at: order.created_at,
    customer_name: profile?.full_name ?? "Customer",
    customer_phone: profile?.phone ?? null,
    customer_note: order.customer_note,
    address_snapshot: order.address_snapshot,
    items: (items ?? []).map((item) => ({
      ...item,
      unit_price_snapshot: Number(item.unit_price_snapshot),
      quantity: Number(item.quantity),
      line_total: Number(item.line_total),
    })),
    history: history ?? [],
  };
}

export async function getAdminProducts(): Promise<AdminProductRow[]> {
  const { supabase } = await adminDb();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, category_id, image_url, unit, quantity_step, price, stock_quantity, status, description")
      .order("name", { ascending: true }),
    supabase.from("categories").select("id, name"),
  ]);

  const names = new Map((categories ?? []).map((category) => [category.id, category.name]));
  return (products ?? []).map((product) => ({
    ...product,
    category_name: product.category_id ? (names.get(product.category_id) ?? null) : null,
    price: Number(product.price),
    quantity_step: Number(product.quantity_step),
    stock_quantity: Number(product.stock_quantity),
  }));
}

export async function getAdminProduct(productId: string): Promise<AdminProductRow | null> {
  const products = await getAdminProducts();
  return products.find((product) => product.id === productId) ?? null;
}

export async function getAdminCategories() {
  const { supabase } = await adminDb();
  const { data } = await supabase.from("categories").select("id, name, slug, sort_order, is_active").order("sort_order");
  return data ?? [];
}

export async function getAdminBuildings() {
  const { supabase } = await adminDb();
  const [{ data }, { data: addresses }, { data: profiles }] = await Promise.all([
    supabase.from("buildings").select("id, name, address, landmark, latitude, longitude, is_active").order("name"),
    supabase.from("addresses").select("building_id"),
    supabase.from("profiles").select("building_id"),
  ]);
  const linked = new Map<string, number>();
  for (const row of [...(addresses ?? []), ...(profiles ?? [])]) {
    if (row.building_id) {
      linked.set(row.building_id, (linked.get(row.building_id) ?? 0) + 1);
    }
  }
  return (data ?? []).map((building) => ({
    ...building,
    latitude: building.latitude == null ? null : Number(building.latitude),
    longitude: building.longitude == null ? null : Number(building.longitude),
    linked_count: linked.get(building.id) ?? 0,
  }));
}

export async function getAdminSettings() {
  const { supabase } = await adminDb();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  return data;
}
