import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import type { AdminOrderRow } from "@/features/admin/queries";
import { formatDateTime } from "@/lib/datetime";
import { formatInr } from "@/lib/money";

export function AdminOrderCard({ order }: { order: AdminOrderRow }) {
  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="group flex items-start gap-2 rounded-xl border border-border bg-white p-3 shadow-sm transition-all hover:border-forest/40 hover:shadow-md"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">{order.order_no}</p>
            <p className="text-[11px] text-muted-foreground">{formatDateTime(order.created_at)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1.5 truncate text-sm font-medium text-gray-800">{order.customer_name}</p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" aria-hidden="true" />
          {order.building_name_snapshot}
        </p>
        <div className="mt-2 flex items-center justify-between border-t border-dashed border-border pt-2">
          <p className="text-sm font-semibold text-gray-900">{formatInr(order.total)}</p>
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-forest">
            View
            <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
