import { cacheLife } from "next/cache";
import { Smartphone } from "lucide-react";
import { SHOP_CONTACT_PHONE } from "@/lib/constants";

type AuthMobileFooterProps = {
  shopName: string;
  shopPhone?: string | null;
};

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  return local.length === 10 ? `+91 ${local.slice(0, 5)} ${local.slice(5)}` : phone;
}

function phoneHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  return local.length === 10 ? `+91${local}` : phone.replace(/[^\d+]/g, "");
}

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function AuthMobileFooter({ shopName, shopPhone }: AuthMobileFooterProps) {
  const phone = shopPhone || SHOP_CONTACT_PHONE;

  return (
    <footer className="mt-auto bg-forest px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-white lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">{shopName}</p>
          <p className="text-[11px] text-white/75">Home delivery · Cash on Delivery</p>
        </div>
        <a
          href={`tel:${phoneHref(phone)}`}
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-white/12 px-3 text-xs font-semibold text-white ring-1 ring-white/15"
          aria-label={`Call ${shopName} on ${formatPhone(phone)}`}
        >
          <Smartphone className="size-3.5 text-sunshine" aria-hidden="true" />
          {formatPhone(phone)}
        </a>
      </div>
      <p className="mt-2 text-center text-[10px] text-white/60">
        &copy; <CopyrightYear /> {shopName}. All rights reserved.
      </p>
    </footer>
  );
}
