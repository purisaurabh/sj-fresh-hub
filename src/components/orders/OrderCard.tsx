import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react";
import {
  PROGRESS_STEPS,
  STATUS_HINT,
  STATUS_ICON,
  formatQuantity,
  isClosedStatus,
} from "@/components/orders/order-status-meta";
import type { CustomerOrder } from "@/features/orders/queries";
import { isOrderStatus, orderStatusBadgeClass, orderStatusLabel } from "@/features/orders/status";
import type { OrderStatus } from "@/lib/constants";
import { formatDateTime } from "@/lib/datetime";
import { formatInr } from "@/lib/money";

function itemsSummary(order: CustomerOrder) {
  const shown = order.items.slice(0, 3).map(
    (item) => `${item.product_name_snapshot} × ${formatQuantity(item.quantity)} ${item.unit_snapshot}`,
  );
  const extra = order.items.length - shown.length;
  return extra > 0 ? `${shown.join(", ")} +${extra} more` : shown.join(", ");
}

function OrderProgress({ status }: { status: OrderStatus }) {
  const current = PROGRESS_STEPS.findIndex((step) => step.status === status);

  return (
    <ol className="grid grid-cols-5 gap-1.5" aria-label="Order progress">
      {PROGRESS_STEPS.map((step, index) => {
        const done = index <= current;
        return (
          <li key={step.status} className="flex flex-col gap-1.5">
            <span
              className={`h-1.5 rounded-full ${done ? "bg-forest" : "bg-mint"} ${index === current ? "animate-pulse" : ""}`}
              aria-hidden="true"
            />
            <span
              className={`truncate text-[11px] ${done ? "font-semibold text-forest" : "text-muted-foreground"}`}
              aria-current={index === current ? "step" : undefined}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderCard({ order }: { order: CustomerOrder }) {
  const status = isOrderStatus(order.status) ? order.status : null;
  const Icon = status ? STATUS_ICON[status] : ShoppingBag;
  const closed = status !== null && isClosedStatus(status);
  const inProgress = status !== null && !closed && status !== "delivered";
  const itemCount = order.items.length;

  return (
    <Link
      href={`/orders/${order.id}`}
      className="group block rounded-2xl border border-border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-forest/40 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:p-5"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl sm:size-12 ${
            status ? orderStatusBadgeClass(status) : "bg-mint text-forest"
          }`}
          aria-hidden="true"
        >
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">Order {order.order_no}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(order.created_at)}</p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                status ? orderStatusBadgeClass(status) : "bg-mint text-forest"
              }`}
            >
              {status ? orderStatusLabel(status) : order.status}
            </span>
          </div>

          {itemCount > 0 ? (
            <p className="mt-2 line-clamp-2 text-sm text-gray-700">{itemsSummary(order)}</p>
          ) : null}

          {status ? (
            <p className={`mt-1 text-xs ${closed ? "text-destructive" : "text-muted-foreground"}`}>
              {STATUS_HINT[status]}
            </p>
          ) : null}
        </div>
      </div>

      {inProgress && status ? (
        <div className="mt-4">
          <OrderProgress status={status} />
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-border pt-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-gray-900">{formatInr(order.total)}</p>
          <p className="truncate text-xs text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"}
            <span className="hidden sm:inline"> · {order.building_name_snapshot}</span> · Cash on Delivery
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold text-forest">
          View details
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
