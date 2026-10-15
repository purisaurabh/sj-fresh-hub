import { Suspense } from "react";
import { BrandLoader } from "@/components/feedback/BrandLoader";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { EmptyState } from "@/components/shop/EmptyState";
import { ensureDefaultDeliveryAddress } from "@/features/addresses/default-address";
import { getMyAddresses } from "@/features/addresses/queries";
import { requireCustomer } from "@/features/auth/session";
import { getActiveBuildings } from "@/features/buildings/queries";
import { getCheckoutSettings } from "@/features/settings/live";

export const metadata = { title: "Checkout" };

async function CheckoutContent() {
  const { user, profile } = await requireCustomer();
  if (!profile) {
    return (
      <EmptyState
        title="Profile is incomplete"
        description="Your account exists, but the profile record is missing. Please contact the shop."
      />
    );
  }

  await ensureDefaultDeliveryAddress(profile.building_id);
  const [addresses, buildings, settings] = await Promise.all([
    getMyAddresses(user.id),
    getActiveBuildings(),
    getCheckoutSettings(),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold md:text-3xl">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm your address and pay cash when the order is delivered.
        </p>
      </div>
      <CheckoutForm
        fullName={profile.full_name}
        phone={profile.phone ?? ""}
        addresses={addresses}
        buildings={buildings}
        defaultBuildingId={profile.building_id}
        isOpen={settings.isOpen}
        deliveryFee={settings.deliveryFee}
        minimumOrder={settings.minimumOrder}
        shopPhone={settings.shopPhone}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<BrandLoader />}>
      <CheckoutContent />
    </Suspense>
  );
}
