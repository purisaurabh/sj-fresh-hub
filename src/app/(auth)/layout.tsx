import type { ReactNode } from "react";
import { Apple, Leaf, Salad, Sparkles, Truck, Wallet } from "lucide-react";
import { PageSlot } from "@/components/feedback/PageSlot";
import { AuthMobileFooter } from "@/components/layout/AuthMobileFooter";
import { Logo } from "@/components/layout/Logo";
import { getPublicSettings } from "@/features/settings/queries";
import { SHOP_CONTACT_PHONE } from "@/lib/constants";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const settings = await getPublicSettings();
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-background lg:grid lg:grid-cols-2">
      <aside className="relative hidden min-h-dvh overflow-hidden bg-linear-to-br from-forest via-[#187524] to-leaf p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-white/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-16 bottom-24 size-80 rounded-full bg-sunshine/20" aria-hidden="true" />
        <Leaf className="pointer-events-none absolute top-28 right-16 size-24 rotate-12 text-white/10" aria-hidden="true" />
        <Apple className="pointer-events-none absolute bottom-36 left-10 size-16 -rotate-12 text-white/10" aria-hidden="true" />
        <Salad className="pointer-events-none absolute right-24 bottom-16 size-20 text-white/10" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-sunshine" aria-hidden="true" />
        <Logo tone="onDark" />
        <div className="relative z-10 max-w-lg">
          <p className="text-xs font-semibold tracking-[0.2em] text-sunshine">FARM FRESH · GOOD FOOD GOOD MOOD</p>
          <p className="mt-4 text-4xl font-semibold leading-tight xl:text-5xl">
            Fresh, healthy & tasty produce delivered to your home
          </p>
          <p className="mt-5 max-w-md text-base text-white/85">
            Hand-picked vegetables and fruits, packed with flavour and ready for your kitchen.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              Farm-fresh vegetables and fruits
            </li>
            <li className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Truck className="size-4" aria-hidden="true" />
              </span>
              Home delivery, packed for freshness
            </li>
            <li className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Wallet className="size-4" aria-hidden="true" />
              </span>
              Pay with Cash on Delivery
            </li>
          </ul>
        </div>
        <p className="relative z-10 text-sm text-white/70">SJ Fresh Hub · Good food, good mood</p>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col lg:h-full">
        <div className="relative flex items-center gap-3 overflow-hidden bg-linear-to-br from-forest to-leaf px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white lg:hidden">
          <Logo tone="onDark" />
          <p className="min-w-0 text-xs font-medium leading-snug text-white/90">
            Fresh produce, delivered home
          </p>
        </div>
        <div className="relative flex flex-1 items-start justify-center bg-background px-4 py-4 sm:px-6 lg:mt-0 lg:h-full lg:items-center lg:bg-mint/70 lg:px-10 lg:py-10">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-4 shadow-[0_18px_50px_rgba(20,97,30,0.08)] sm:rounded-3xl sm:p-8">
            <PageSlot>{children}</PageSlot>
          </div>
        </div>
        <AuthMobileFooter shopName={settings.shop_name} shopPhone={settings.shop_phone || SHOP_CONTACT_PHONE} />
      </div>
    </div>
  );
}
