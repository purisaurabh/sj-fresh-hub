import { isOrderStatus } from "@/features/orders/status";
import { isIsoDateOnly } from "@/lib/datetime";

export type AdminOrdersFilter = {
  status?: string;
  building?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isBuildingId(value: string | undefined): value is string {
  return Boolean(value && UUID_RE.test(value));
}

export function parseAdminOrdersFilter(params: {
  status?: string;
  building?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: string;
}): AdminOrdersFilter {
  let from = isIsoDateOnly(params.from) ? params.from : undefined;
  let to = isIsoDateOnly(params.to) ? params.to : undefined;
  if (from && to && from > to) {
    const swapped = from;
    from = to;
    to = swapped;
  }

  const q = params.q?.trim().replace(/[%_]/g, "").replace(/\s+/g, " ").slice(0, 40) || undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  return {
    status: params.status && isOrderStatus(params.status) ? params.status : undefined,
    building: isBuildingId(params.building) ? params.building : undefined,
    from,
    to,
    q,
    page: page > 1 ? page : undefined,
  };
}

export function ordersFilterHref(filter: AdminOrdersFilter = {}) {
  const params = new URLSearchParams();
  if (filter.status && isOrderStatus(filter.status)) {
    params.set("status", filter.status);
  }
  if (isBuildingId(filter.building)) {
    params.set("building", filter.building);
  }
  if (filter.from && isIsoDateOnly(filter.from)) {
    params.set("from", filter.from);
  }
  if (filter.to && isIsoDateOnly(filter.to)) {
    params.set("to", filter.to);
  }
  if (filter.q) {
    params.set("q", filter.q);
  }
  if (filter.page && filter.page > 1) {
    params.set("page", String(filter.page));
  }
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

export function hasAdminOrdersFilters(filter: AdminOrdersFilter) {
  return Boolean(filter.status || filter.building || filter.from || filter.to || filter.q);
}
