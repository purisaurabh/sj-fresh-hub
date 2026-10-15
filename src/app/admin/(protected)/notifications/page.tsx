import { connection } from "next/server";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NotificationInbox } from "@/components/notifications/NotificationInbox";
import { PushEnableButton } from "@/components/notifications/PushEnableButton";
import { getMyNotifications } from "@/features/notifications/queries";

export const metadata = { title: "Notifications" };

async function AdminNotificationsContent() {
  await connection();
  const notifications = await getMyNotifications();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <AdminPageHeader
        title="Notifications"
        description="New Cash on Delivery orders appear here as they come in."
      />
      <PushEnableButton />
      <NotificationInbox notifications={notifications} role="admin" />
    </div>
  );
}

export default function AdminNotificationsPage() {
  return <AdminNotificationsContent />;
}
