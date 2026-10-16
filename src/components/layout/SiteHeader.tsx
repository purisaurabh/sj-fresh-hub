import { Suspense } from "react";
import Link from "next/link";
import { Home, UserRound } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { CartLink } from "@/components/layout/CartLink";
import { ProfileMenu } from "@/components/auth/ProfileMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { getAuthContext } from "@/features/auth/session";
import { getUnreadNotificationCount } from "@/features/notifications/queries";

function HeaderActionsFallback() {
  return <span className="inline-flex size-11 items-center justify-center" aria-hidden="true">
    <span className="size-8 animate-pulse rounded-full bg-mint" />
  </span>;
}

async function HeaderActions() {
  const { user, profile } = await getAuthContext();

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-forest hover:bg-mint"
        aria-label="Log in"
      >
        <UserRound className="size-5" />
      </Link>
    );
  }

  const name = profile?.full_name ?? "";
  const phone = profile?.phone ?? null;

  if (profile?.role === "admin") {
    return (
      <>
        <Link
          href="/admin/orders"
          className="inline-flex min-h-11 items-center rounded-lg bg-forest px-4 text-sm font-semibold text-white hover:bg-forest/90"
        >
          View Dashboard
        </Link>
        <ProfileMenu name={name} phone={phone} />
      </>
    );
  }

  const unreadCount = await getUnreadNotificationCount();

  return (
    <>
      <Link
        href="/"
        className="hidden min-h-11 min-w-11 items-center justify-center rounded-lg text-forest hover:bg-mint md:flex"
        aria-label="Home"
      >
        <Home className="size-5" aria-hidden="true" />
      </Link>
      <Link
        href="/orders"
        className="hidden min-h-11 items-center rounded-lg px-3 text-sm font-medium text-gray-700 hover:bg-mint md:flex"
      >
        My Orders
      </Link>
      <NotificationBell
        unreadCount={unreadCount}
        userId={user.id}
        role={profile?.role}
        className="hidden md:flex"
      />
      <ProfileMenu name={name} phone={phone} showProfileLink />
    </>
  );
}

async function HeaderCart() {
  const { profile } = await getAuthContext();
  if (profile?.role === "admin") {
    return null;
  }
  return <CartLink className="hidden md:flex" />;
}

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-[1250px] flex-col gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          <HeaderSearch id="product-search" className="hidden min-w-0 flex-1 md:block lg:px-8" />
          <nav className="flex items-center gap-1" aria-label="Account">
            <Suspense fallback={<HeaderActionsFallback />}>
              <HeaderActions />
            </Suspense>
            <Suspense fallback={null}>
              <HeaderCart />
            </Suspense>
          </nav>
        </div>
        <HeaderSearch id="product-search-mobile" className="md:hidden" />
      </div>
    </header>
  );
}
