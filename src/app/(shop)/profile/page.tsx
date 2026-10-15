import Link from "next/link";
import { Suspense } from "react";
import { Building2, PackageOpen, Phone, ShoppingBag, Truck } from "lucide-react";
import { BrandLoader } from "@/components/feedback/BrandLoader";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { PushEnableButton } from "@/components/notifications/PushEnableButton";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { SavedAddressesPanel } from "@/components/profile/SavedAddressesPanel";
import { EmptyState } from "@/components/shop/EmptyState";
import { getMyAddresses } from "@/features/addresses/queries";
import { requireCustomer } from "@/features/auth/session";
import { getActiveBuildings } from "@/features/buildings/queries";
import { getMyOrders } from "@/features/orders/queries";
import { formatPhone } from "@/lib/datetime";

export const metadata = { title: "Profile" };

const ACTIVE_STATUSES = new Set(["placed", "accepted", "preparing", "out_for_delivery"]);

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0]![0]}${parts.at(-1)![0]}` : (parts[0]?.slice(0, 2) ?? "");
  return letters.toUpperCase() || "SJ";
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

async function ProfileContent() {
  const { user, profile } = await requireCustomer();
  const [buildings, addresses, orders] = await Promise.all([
    getActiveBuildings(),
    getMyAddresses(user.id),
    getMyOrders(user.id),
  ]);

  if (!profile) {
    return (
      <EmptyState
        title="Profile is incomplete"
        description="Your account exists, but the profile record is missing. Please contact the shop."
      />
    );
  }

  const selectedBuilding = buildings.find((building) => building.id === profile.building_id);
  const activeOrders = orders.filter((order) => ACTIVE_STATUSES.has(order.status)).length;
  const deliveredOrders = orders.filter((order) => order.status === "delivered").length;
  const stats = [
    { label: "Orders", value: orders.length, icon: ShoppingBag },
    { label: "Active", value: activeOrders, icon: Truck },
    { label: "Delivered", value: deliveredOrders, icon: PackageOpen },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-forest to-leaf p-5 text-white shadow-md sm:p-6">
        <span className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/10" aria-hidden="true" />
        <span className="pointer-events-none absolute -bottom-20 right-24 size-40 rounded-full bg-sunshine/15" aria-hidden="true" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-bold text-forest shadow-sm ring-4 ring-white/25 sm:size-20 sm:text-2xl">
              {initials(profile.full_name)}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wide text-white/75 uppercase">Your profile</p>
              <h1 className="truncate text-xl font-semibold sm:text-2xl">{profile.full_name || "SJ Fresh Hub customer"}</h1>
              <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
                  <Phone className="size-3.5" aria-hidden="true" />
                  {formatPhone(profile.phone)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
                  <Building2 className="size-3.5" aria-hidden="true" />
                  {selectedBuilding?.name ?? "No building selected"}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {stats.map(({ label, value, icon: Icon }) => (
              <Link
                key={label}
                href="/orders"
                className="rounded-xl bg-white/12 px-3 py-2.5 text-center ring-1 ring-white/20 transition-colors hover:bg-white/20 sm:min-w-24"
              >
                <Icon className="mx-auto size-4 text-sunshine" aria-hidden="true" />
                <p className="mt-1 text-lg font-semibold">{value}</p>
                <p className="text-[11px] text-white/80">{label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="Account details">
          <ProfileForm
            phone={profile.phone ?? ""}
            buildings={buildings}
            defaultValues={{
              fullName: profile.full_name,
              buildingId: profile.building_id ?? "",
            }}
          />
        </Panel>

        <div className="flex flex-col gap-5">
          <PushEnableButton />
          <SavedAddressesPanel buildings={buildings} addresses={addresses} />

          <section className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm sm:px-6">
            <div>
              <p className="font-medium text-gray-900">Sign out</p>
              <p className="text-xs text-muted-foreground">You can log back in with your mobile number.</p>
            </div>
            <LogoutButton />
          </section>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<BrandLoader />}>
      <ProfileContent />
    </Suspense>
  );
}
