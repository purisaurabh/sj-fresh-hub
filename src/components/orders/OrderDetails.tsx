import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CircleCheckBig,
  MapPin,
  MessageSquareText,
  Phone,
  ReceiptText,
  ShoppingBasket,
} from "lucide-react";
import { MarkNotificationReadOnView } from "@/components/notifications/MarkNotificationReadOnView";
import { CancelOrderButton } from "@/components/orders/CancelOrderButton";
import { ClearCartOnMount } from "@/components/orders/ClearCartOnMount";
import {
  PROGRESS_STEPS,
  STATUS_HINT,
  STATUS_ICON,
  formatQuantity,
  isClosedStatus,
} from "@/components/orders/order-status-meta";
import { Button } from "@/components/ui/button";
import type { CustomerOrder, OrderStatusEvent } from "@/features/orders/queries";
import {
  canCustomerCancel,
  isOrderStatus,
  orderStatusLabel,
} from "@/features/orders/status";
import type { OrderStatus } from "@/lib/constants";
import { formatDateTime, formatPhone } from "@/lib/datetime";
import { formatInr, formatPriceWithUnit } from "@/lib/money";

type AddressSnapshot = {
  label: string | null;
  line1: string | null;
  landmark: string | null;
  pincode: string | null;
};

function readAddress(snapshot: unknown): AddressSnapshot {
  const value = snapshot && typeof snapshot === "object" ? (snapshot as Record<string, unknown>) : {};
  const text = (key: string) => (typeof value[key] === "string" && value[key] ? (value[key] as string) : null);
  return { label: text("label"), line1: text("line1"), landmark: text("landmark"), pincode: text("pincode") };
}

function stepTimes(history: OrderStatusEvent[]) {
  const times = new Map<string, string>();
  for (const event of history) {
    times.set(event.status, event.created_at);
  }
  return times;
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
      <h2 className="flex items-center gap-2 font-semibold text-gray-900">
        <span className="flex size-8 items-center justify-center rounded-lg bg-mint text-forest">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProgressTracker({ status, times }: { status: OrderStatus; times: Map<string, string> }) {
  const current = PROGRESS_STEPS.findIndex((step) => step.status === status);

  return (
    <ol className="mt-6 grid grid-cols-5" aria-label="Order progress">
      {PROGRESS_STEPS.map((step, index) => {
        const done = index <= current;
        const active = index === current;
        const StepIcon = STATUS_ICON[step.status];
        const time = times.get(step.status);
        return (
          <li key={step.status} className="relative flex flex-col items-center text-center">
            {index > 0 ? (
              <span
                className={`absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2 ${index <= current ? "bg-white" : "bg-white/25"}`}
                aria-hidden="true"
              />
            ) : null}
            <span
              className={`relative flex size-8 items-center justify-center rounded-full ring-4 ${
                done ? "bg-white text-forest ring-white/20" : "bg-forest text-white/60 ring-transparent"
              } ${active ? "ring-sunshine/60" : ""} ${done ? "" : "border border-white/30"}`}
              aria-current={active ? "step" : undefined}
            >
              {done && !active ? <Check className="size-4" aria-hidden="true" /> : <StepIcon className="size-4" aria-hidden="true" />}
            </span>
            <span className={`mt-2 text-[11px] leading-tight sm:text-xs ${done ? "font-semibold text-white" : "text-white/60"}`}>
              {step.label}
            </span>
            {time && done ? (
              <span className="mt-0.5 hidden text-[10px] text-white/70 sm:block">
                {new Intl.DateTimeFormat("en-IN", { timeStyle: "short", timeZone: "Asia/Kolkata" }).format(Date.parse(time))}
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

type OrderDetailsProps = {
  order: CustomerOrder;
  history: OrderStatusEvent[];
  shopPhone: string;
  isNew?: boolean;
};

export function OrderDetails({ order, history, shopPhone, isNew = false }: OrderDetailsProps) {
  const status = isOrderStatus(order.status) ? order.status : null;
  const closed = status !== null && isClosedStatus(status);
  const StatusIcon = status ? STATUS_ICON[status] : ShoppingBasket;
  const address = readAddress(order.address_snapshot);
  const shopDigits = shopPhone.replace(/\D/g, "").slice(-10);
  const times = stepTimes(history);
  const itemCount = order.items.length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <MarkNotificationReadOnView />
      {isNew ? <ClearCartOnMount /> : null}

      <Link
        href="/orders"
        className="inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-medium text-forest hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All orders
      </Link>

      {isNew ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <CircleCheckBig className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Order placed successfully!</p>
            <p className="text-sm text-emerald-800">
              We&apos;ve sent it to the shop. Keep {formatInr(order.total)} ready to pay in cash on delivery.
            </p>
          </div>
        </div>
      ) : null}

      <section
        className={`overflow-hidden rounded-2xl p-5 text-white shadow-md sm:p-6 ${
          closed ? "bg-linear-to-br from-red-700 to-red-500" : "bg-linear-to-br from-forest to-leaf"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
              <StatusIcon className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium tracking-wide text-white/75 uppercase">Order {order.order_no}</p>
              <h1 className="text-xl font-semibold sm:text-2xl">
                {status ? orderStatusLabel(status) : order.status}
              </h1>
              <p className="mt-0.5 text-sm text-white/85">{status ? STATUS_HINT[status] : null}</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-white/75">Placed on</p>
            <p className="text-sm font-medium">{formatDateTime(order.created_at)}</p>
          </div>
        </div>

        {status && !closed ? <ProgressTracker status={status} times={times} /> : null}
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-5">
          <Card title={`Items (${itemCount})`} icon={ShoppingBasket}>
            <ul className="divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-mint text-sm font-semibold text-forest">
                    {item.product_name_snapshot.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">{item.product_name_snapshot}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatQuantity(item.quantity)} {item.unit_snapshot} ×{" "}
                      {formatPriceWithUnit(item.unit_price_snapshot, item.unit_snapshot)}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-gray-900">{formatInr(item.line_total)}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Bill summary" icon={ReceiptText}>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Item total</dt>
                <dd>{formatInr(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery fee</dt>
                <dd className={order.delivery_fee === 0 ? "font-medium text-forest" : undefined}>
                  {order.delivery_fee === 0 ? "FREE" : formatInr(order.delivery_fee)}
                </dd>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-dashed border-border pt-3">
                <dt className="font-semibold text-gray-900">Order total</dt>
                <dd className="text-lg font-bold text-gray-900">{formatInr(order.total)}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <aside className="flex flex-col gap-5">
          <Card title="Delivery address" icon={MapPin}>
            {address.label ? (
              <span className="mb-1.5 inline-flex rounded-full bg-mint px-2 py-0.5 text-xs font-semibold text-forest">
                {address.label}
              </span>
            ) : null}
            <p className="font-medium text-gray-900">{order.building_name_snapshot}</p>
            {address.line1 ? <p className="text-sm text-muted-foreground">{address.line1}</p> : null}
            {address.landmark ? <p className="text-sm text-muted-foreground">Near {address.landmark}</p> : null}
            {address.pincode ? <p className="text-sm text-muted-foreground">PIN {address.pincode}</p> : null}
          </Card>

          {order.customer_note ? (
            <Card title="Your note" icon={MessageSquareText}>
              <p className="text-sm text-gray-700">{order.customer_note}</p>
            </Card>
          ) : null}

          <section className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
            <p className="font-semibold text-gray-900">Need help with this order?</p>
            <p className="mt-1 text-sm text-muted-foreground">Call the shop and share your order number.</p>
            <Button asChild variant="outline" className="mt-3 h-11 w-full border-forest/30 text-forest hover:bg-mint">
              <a href={`tel:+91${shopDigits}`}>
                <Phone className="size-4" aria-hidden="true" />
                Call {formatPhone(shopDigits)}
              </a>
            </Button>
            {status && canCustomerCancel(status) ? (
              <div className="mt-3 [&_button]:w-full [&_button]:border-destructive/30 [&_button]:text-destructive">
                <CancelOrderButton orderId={order.id} />
              </div>
            ) : null}
          </section>

          <Button asChild className="h-12 bg-forest text-white hover:bg-forest/90">
            <Link href="/">
              <ShoppingBasket className="size-4" aria-hidden="true" />
              Continue shopping
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
