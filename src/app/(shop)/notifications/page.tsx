import { connection } from "next/server";
import { redirect } from "next/navigation";
import { DesktopNotificationsRedirect } from "@/components/notifications/DesktopNotificationsRedirect";
import { NotificationInbox } from "@/components/notifications/NotificationInbox";
import { requireUser } from "@/features/auth/session";
import { getMyNotificationsPage } from "@/features/notifications/queries";
import { notificationsPathForRole } from "@/features/notifications/paths";

export const metadata = { title: "Notifications" };

async function NotificationsContent() {
  await connection();
  const { profile } = await requireUser();
  if (profile?.role === "admin") {
    redirect(notificationsPathForRole("admin"));
  }
  const page = await getMyNotificationsPage();

  return (
    <>
      <DesktopNotificationsRedirect href="/" />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 md:hidden">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Alerts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live updates about your orders, all in one place.</p>
        </div>
        <NotificationInbox
          initialNotifications={page.notifications}
          initialHasMore={page.hasMore}
          role={profile?.role ?? "customer"}
        />
      </div>
    </>
  );
}

export default async function NotificationsPage() {
  return <NotificationsContent />;
}
