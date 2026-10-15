import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BrandLoader } from "@/components/feedback/BrandLoader";
import { NotificationInbox } from "@/components/notifications/NotificationInbox";
import { requireUser } from "@/features/auth/session";
import { getMyNotifications } from "@/features/notifications/queries";
import { notificationsPathForRole } from "@/features/notifications/paths";

export const metadata = { title: "Notifications" };

async function NotificationsContent() {
  await connection();
  const { profile } = await requireUser();
  if (profile?.role === "admin") {
    redirect(notificationsPathForRole("admin"));
  }
  const notifications = await getMyNotifications();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 md:text-2xl">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Live updates about your orders, all in one place.</p>
      </div>
      <NotificationInbox notifications={notifications} role={profile?.role ?? "customer"} />
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<BrandLoader />}>
      <NotificationsContent />
    </Suspense>
  );
}
