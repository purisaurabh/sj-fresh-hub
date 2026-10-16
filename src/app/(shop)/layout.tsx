import type { ReactNode } from "react";
import { Suspense } from "react";
import { MobileNav } from "@/components/layout/MobileNav";
import { MobileNavChrome } from "@/components/layout/MobileNavChrome";
import { ShopShell } from "@/components/layout/ShopShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LoggedInPushPrompt } from "@/components/notifications/LoggedInPushPrompt";
import { UnreadBadge } from "@/components/notifications/UnreadBadge";
import { getAuthContext } from "@/features/auth/session";
import { getUnreadNotificationCount } from "@/features/notifications/queries";
import { getPublicSettings } from "@/features/settings/queries";
import { SHOP_CONTACT_PHONE } from "@/lib/constants";

async function ShopMobileNav() {
  const { user } = await getAuthContext();
  if (!user) {
    return <MobileNav showAlerts={false} />;
  }

  const unreadCount = await getUnreadNotificationCount();

  return (
    <MobileNav showAlerts unreadBadge={<UnreadBadge userId={user.id} initialCount={unreadCount} />} />
  );
}

async function ShopPushPrompt() {
  const { user } = await getAuthContext();
  if (!user) {
    return null;
  }
  return <LoggedInPushPrompt />;
}

export default async function ShopLayout({ children }: { children: ReactNode }) {
  const settings = await getPublicSettings();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1250px] flex-1 px-4 py-4 md:px-6 md:py-6">
        <ShopShell>{children}</ShopShell>
      </main>
      <SiteFooter
        shopName={settings.shop_name}
        shopPhone={settings.shop_phone || SHOP_CONTACT_PHONE}
        deliveryArea={settings.delivery_area_text}
      />
      <Suspense fallback={<MobileNavChrome showAlerts={false} />}>
        <ShopMobileNav />
      </Suspense>
      <Suspense fallback={null}>
        <ShopPushPrompt />
      </Suspense>
    </div>
  );
}
