import { Suspense } from "react";
import { BrandLoader } from "@/components/feedback/BrandLoader";
import { CartView } from "@/components/cart/CartView";
import { getCheckoutSettings } from "@/features/settings/live";

export const metadata = { title: "Cart" };

async function CartContent() {
  const settings = await getCheckoutSettings();
  return (
    <CartView deliveryFee={settings.deliveryFee} minimumOrder={settings.minimumOrder} isOpen={settings.isOpen} />
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<BrandLoader />}>
      <CartContent />
    </Suspense>
  );
}
