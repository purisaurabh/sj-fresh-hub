import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sortOrdersNewestFirst } from "@/features/orders/sort";
import { ORDERS_PAGE_SIZE } from "@/lib/constants";
import type { Json } from "@/types/database.types";

export type OrderItemRow = {
  id: string;
  product_id: string | null;
  product_name_snapshot: string;
  unit_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
};

export type CustomerOrder = {
  id: string;
  order_no: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  building_name_snapshot: string;
  address_snapshot: Json;
  customer_note: string | null;
  distance_km: number | null;
  created_at: string;
  items: OrderItemRow[];
};

type OrderRow = {
  id: string;
  order_no: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  building_name_snapshot: string;
  address_snapshot: Json;
  customer_note: string | null;
  distance_km: number | null;
  created_at: string;
};

export async function getMyOrders(userId: string): Promise<CustomerOrder[]> {
  const supabase = await createServerSupabaseClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, order_no, status, payment_method, payment_status, subtotal, delivery_fee, total, building_name_snapshot, address_snapshot, customer_note, distance_km, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .order("order_no", { ascending: false });

  return attachItems(sortOrdersNewestFirst(orders ?? []));
}

export async function getMyOrdersPage(
  userId: string,
  page = 1,
): Promise<{ orders: CustomerOrder[]; total: number; page: number; pageSize: number }> {
  const supabase = await createServerSupabaseClient();
  const pageSize = ORDERS_PAGE_SIZE;
  const safePage = Math.max(1, page);
  const fromIndex = (safePage - 1) * pageSize;
  const { data: orders, count } = await supabase
    .from("orders")
    .select(
      "id, order_no, status, payment_method, payment_status, subtotal, delivery_fee, total, building_name_snapshot, address_snapshot, customer_note, distance_km, created_at",
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .order("order_no", { ascending: false })
    .range(fromIndex, fromIndex + pageSize - 1);

  return {
    orders: await attachItems(sortOrdersNewestFirst(orders ?? [])),
    total: count ?? 0,
    page: safePage,
    pageSize,
  };
}

export async function getMyOrder(userId: string, orderId: string): Promise<CustomerOrder | null> {
  const supabase = await createServerSupabaseClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_no, status, payment_method, payment_status, subtotal, delivery_fee, total, building_name_snapshot, address_snapshot, customer_note, distance_km, created_at",
    )
    .eq("user_id", userId)
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return null;
  }

  const [mapped] = await attachItems([order]);
  return mapped ?? null;
}

export type OrderStatusEvent = {
  status: string;
  created_at: string;
};

export async function getOrderStatusHistory(orderId: string): Promise<OrderStatusEvent[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("order_status_history")
    .select("new_status, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((row) => ({ status: row.new_status, created_at: row.created_at }));
}

async function attachItems(orders: OrderRow[]): Promise<CustomerOrder[]> {
  if (orders.length === 0) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  const { data: items } = await supabase
    .from("order_items")
    .select("id, order_id, product_id, product_name_snapshot, unit_snapshot, unit_price_snapshot, quantity, line_total")
    .in(
      "order_id",
      orders.map((order) => order.id),
    );

  const byOrder = new Map<string, OrderItemRow[]>();
  for (const item of items ?? []) {
    const list = byOrder.get(item.order_id) ?? [];
    list.push({
      id: item.id,
      product_id: item.product_id,
      product_name_snapshot: item.product_name_snapshot,
      unit_snapshot: item.unit_snapshot,
      unit_price_snapshot: Number(item.unit_price_snapshot),
      quantity: Number(item.quantity),
      line_total: Number(item.line_total),
    });
    byOrder.set(item.order_id, list);
  }

  return orders.map((order) => ({
    id: order.id,
    order_no: order.order_no,
    status: order.status,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    subtotal: Number(order.subtotal),
    delivery_fee: Number(order.delivery_fee),
    total: Number(order.total),
    building_name_snapshot: order.building_name_snapshot,
    address_snapshot: order.address_snapshot,
    customer_note: order.customer_note,
    distance_km: order.distance_km == null ? null : Number(order.distance_km),
    created_at: order.created_at,
    items: byOrder.get(order.id) ?? [],
  }));
}
