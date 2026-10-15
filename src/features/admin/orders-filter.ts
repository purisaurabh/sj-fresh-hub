import { isIsoDateOnly } from "@/lib/datetime";

export function ordersFilterHref(status?: string, from?: string, page?: number) {
  const params = new URLSearchParams();
  if (status) {
    params.set("status", status);
  }
  if (from && isIsoDateOnly(from)) {
    params.set("from", from);
  }
  if (page && page > 1) {
    params.set("page", String(page));
  }
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}
