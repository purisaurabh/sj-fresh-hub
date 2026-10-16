import { connection } from "next/server";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DesktopNotificationsRedirect } from "@/components/notifications/DesktopNotificationsRedirect";
import { NotificationInbox } from "@/components/notifications/NotificationInbox";
import { getMyNotificationsPage } from "@/features/notifications/queries";

export const metadata = { title: "Notifications" };

async function AdminNotificationsContent() {
  await connection();
  const page = await getMyNotificationsPage();

  return (
    <>
      <DesktopNotificationsRedirect href="/admin/orders" />
      <div className="mx-auto flex max-w-3xl flex-col gap-5 md:hidden">
        <AdminPageHeader
          title="Alerts"
          description="New Cash on Delivery orders appear here as they come in."
        />
        <NotificationInbox
          initialNotifications={page.notifications}
          initialHasMore={page.hasMore}
          role="admin"
        />
      </div>
    </>
  );
}

export default function AdminNotificationsPage() {
  return <AdminNotificationsContent />;
}
