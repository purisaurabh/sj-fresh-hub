import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MarkNotificationReadOnView } from "@/components/notifications/MarkNotificationReadOnView";
import { OrderMap } from "@/components/admin/OrderMap";
import { OrderStatusActions } from "@/components/admin/OrderStatusActions";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { parseAddressSnapshot } from "@/features/admin/address-snapshot";
import { getAdminOrder } from "@/features/admin/queries";
import { isOrderStatus, orderStatusLabel } from "@/features/orders/status";
import { formatDateTime, formatPhone } from "@/lib/datetime";
import { formatInr, formatPriceWithUnit } from "@/lib/money";

export const metadata = { title: "Order" };

type OrderDetailProps = {
  params: Promise<{ id: string }>;
};

async function OrderDetail({ params }: OrderDetailProps) {
  await connection();
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) {
    notFound();
  }

  const address = parseAddressSnapshot(order.address_snapshot);
  const mapLine = address?.line1 ?? order.building_name_snapshot;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <MarkNotificationReadOnView />
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-medium text-forest hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All orders
        </Link>
        <h1 className="mt-2 text-lg font-semibold md:text-2xl">{order.order_no}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(order.created_at)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>
      <section className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <h2 className="font-semibold">Customer</h2>
        <p className="mt-2 text-sm">{order.customer_name}</p>
        {order.customer_phone ? (
          <a href={`tel:+91${order.customer_phone}`} className="text-sm font-medium text-forest">
            {formatPhone(order.customer_phone)}
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">No phone on file</p>
        )}
        <Link href={`/admin/users/${order.user_id}`} className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-forest hover:underline">
          View customer
        </Link>
      </section>
      <section className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <h2 className="font-semibold">Delivery</h2>
        <p className="mt-2 text-sm">{order.building_name_snapshot}</p>
        {address ? (
          <>
            <p className="text-sm text-muted-foreground">{address.line1}</p>
            {address.landmark ? <p className="text-sm text-muted-foreground">{address.landmark}</p> : null}
            {address.pincode ? <p className="text-sm text-muted-foreground">{address.pincode}</p> : null}
          </>
        ) : null}
        <div className="mt-4">
          <OrderMap
            line1={mapLine}
            landmark={address?.landmark}
            buildingName={order.building_name_snapshot}
            pincode={address?.pincode}
          />
        </div>
      </section>
      <section className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <h2 className="font-semibold">Items</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>
                {item.product_name_snapshot}
                <span className="block text-muted-foreground">
                  {item.quantity} {item.unit_snapshot} ·{" "}
                  {formatPriceWithUnit(item.unit_price_snapshot, item.unit_snapshot)}
                </span>
              </span>
              <span className="font-medium">{formatInr(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatInr(order.subtotal)}</span>
        </p>
        <p className="mt-2 flex justify-between text-sm">
          <span>Delivery</span>
          <span>{formatInr(order.delivery_fee)}</span>
        </p>
        <p className="mt-3 flex justify-between font-semibold">
          <span>Total to collect</span>
          <span>{formatInr(order.total)}</span>
        </p>
        {order.customer_note ? (
          <p className="mt-3 text-sm text-muted-foreground">Note: {order.customer_note}</p>
        ) : null}
      </section>
      <section className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <h2 className="font-semibold">Update status</h2>
        <div className="mt-3">
          <OrderStatusActions orderId={order.id} status={order.status} paymentStatus={order.payment_status} />
        </div>
      </section>
      <section className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <h2 className="font-semibold">Status history</h2>
        {order.history.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No status changes yet.</p>
        ) : (
          <ol className="mt-3 space-y-2 text-sm">
            {order.history.map((entry) => (
              <li key={entry.id}>
                <span className="font-medium">
                  {entry.old_status && isOrderStatus(entry.old_status)
                    ? orderStatusLabel(entry.old_status)
                    : (entry.old_status ?? "New")}{" "}
                  → {isOrderStatus(entry.new_status) ? orderStatusLabel(entry.new_status) : entry.new_status}
                </span>
                <span className="block text-muted-foreground">{formatDateTime(entry.created_at)}</span>
                {entry.note ? <span className="block text-muted-foreground">{entry.note}</span> : null}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

export default function AdminOrderPage({ params }: OrderDetailProps) {
  return <OrderDetail params={params} />;
}
