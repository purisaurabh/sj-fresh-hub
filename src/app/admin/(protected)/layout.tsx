import type { ReactNode } from "react";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProfileMenu } from "@/components/auth/ProfileMenu";
import { BrandLoader } from "@/components/feedback/BrandLoader";
import { NotificationsRealtime } from "@/components/notifications/NotificationsRealtime";
import { UnreadBadge } from "@/components/notifications/UnreadBadge";
import { requireAdmin } from "@/features/auth/session";
import { getUnreadNotificationCount } from "@/features/notifications/queries";

async function AdminUnreadBadge() {
  const { user } = await requireAdmin();
  const unreadCount = await getUnreadNotificationCount();

  return <UnreadBadge userId={user.id} initialCount={unreadCount} />;
}

async function AdminProfileMenu() {
  const { profile } = await requireAdmin();
  return <ProfileMenu name={profile?.full_name ?? ""} phone={profile?.phone ?? null} />;
}

async function AdminSessionWidgets() {
  const { user } = await requireAdmin();
  return (
    <>
      <NotificationsRealtime userId={user.id} />
    </>
  );
}

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <AdminSessionWidgets />
      </Suspense>
      <AdminShell
        unreadBadge={
          <Suspense fallback={null}>
            <AdminUnreadBadge />
          </Suspense>
        }
        profileMenu={
          <Suspense fallback={<span className="inline-flex size-11" aria-hidden="true" />}>
            <AdminProfileMenu />
          </Suspense>
        }
      >
        <Suspense fallback={<BrandLoader />}>{children}</Suspense>
      </AdminShell>
    </>
  );
}
