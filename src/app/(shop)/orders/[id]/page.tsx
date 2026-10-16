import { notFound } from "next/navigation";
import { OrderDetails } from "@/components/orders/OrderDetails";
import { requireCustomer } from "@/features/auth/session";
import { getMyOrder, getOrderStatusHistory } from "@/features/orders/queries";
import { getPublicSettings } from "@/features/settings/queries";
import { SHOP_CONTACT_PHONE } from "@/lib/constants";

export const metadata = { title: "Order details" };

type OrderPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
};

async function OrderContent({ params, searchParams }: OrderPageProps) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const { user } = await requireCustomer();
  const [order, history, settings] = await Promise.all([
    getMyOrder(user.id, id),
    getOrderStatusHistory(id),
    getPublicSettings(),
  ]);

  if (!order) {
    notFound();
  }

  return (
    <OrderDetails
      order={order}
      history={history}
      shopPhone={settings.shop_phone || SHOP_CONTACT_PHONE}
      isNew={isNew === "1"}
    />
  );
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  return <OrderContent params={params} searchParams={searchParams} />;
}
