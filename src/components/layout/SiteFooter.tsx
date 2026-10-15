import { Leaf, MapPin, Smartphone, Truck, Wallet } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

type SiteFooterProps = {
  shopName: string;
  shopPhone?: string | null;
  deliveryArea: string;
};

const highlights = [
  { icon: Leaf, label: "Farm fresh daily" },
  { icon: Truck, label: "Home delivery" },
  { icon: Wallet, label: "Cash on Delivery" },
];

function localDigits(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
}

function formatPhone(phone: string) {
  const digits = localDigits(phone);
  return digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : phone;
}

function phoneHref(phone: string) {
  const digits = localDigits(phone);
  return digits.length === 10 ? `+91${digits}` : phone.replace(/[^\d+]/g, "");
}

function CopyrightYear() {
  return <>{new Date().getFullYear()}</>;
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold tracking-wide text-sunshine uppercase">{children}</h2>;
}

export function SiteFooter({ shopName, shopPhone, deliveryArea }: SiteFooterProps) {
  return (
    <footer className="mt-auto bg-forest text-white">
      <div className="mx-auto max-w-[1250px] px-4 pt-10 pb-22 md:px-6 md:pt-12 md:pb-6">
        <div className="grid gap-8 md:grid-cols-12 lg:gap-10">
          <div className="flex flex-col gap-4 md:col-span-7 lg:col-span-6">
            <Logo tone="onDark" />
            <p className="max-w-sm text-sm leading-relaxed text-white/80">
              Fresh, healthy and tasty vegetables and fruits, hand-picked and packed with care, delivered to your
              doorstep.
            </p>
            <ul className="flex flex-wrap gap-2">
              {highlights.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/15"
                >
                  <Icon className="size-3.5 text-sunshine" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 md:col-span-5 lg:col-start-8">
            <FooterHeading>Get in touch</FooterHeading>
            <ul className="flex flex-col gap-3 text-sm text-white/80">
              {shopPhone ? (
                <li>
                  <a
                    href={`tel:${phoneHref(shopPhone)}`}
                    className="group inline-flex min-h-11 items-center gap-2 text-white"
                    aria-label={`Call ${shopName} on ${formatPhone(shopPhone)}`}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sunshine text-forest">
                      <Smartphone className="size-4" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col leading-tight">
                      <span className="text-xs text-white/70">Call us</span>
                      <span className="font-semibold tracking-wide tabular-nums group-hover:text-sunshine">
                        {formatPhone(shopPhone)}
                      </span>
                    </span>
                  </a>
                </li>
              ) : null}
              <li className="flex items-start gap-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <MapPin className="size-4" aria-hidden="true" />
                </span>
                <span className="pt-1.5">{deliveryArea}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Wallet className="size-4" aria-hidden="true" />
                </span>
                <span className="pt-1.5">Pay with cash when your order arrives.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/15 pt-6 text-center text-xs text-white/70 sm:flex-row sm:justify-between sm:text-left">
          <p>
            &copy; <CopyrightYear /> {shopName}. All rights reserved.
          </p>
          <p>Good food, good mood.</p>
        </div>
      </div>
    </footer>
  );
}
