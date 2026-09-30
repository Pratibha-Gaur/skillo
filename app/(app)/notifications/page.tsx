import type { Metadata } from "next";
import { NotificationList } from "@/components/notifications/notification-list";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireOnboardedUser();
  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return (
    <div className="page-shell max-w-3xl py-8 sm:py-10">
      <p className="text-sm font-extrabold text-brand">Notifications</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
        What needs your attention.
      </h1>
      <p className="mt-3 leading-7 text-muted">
        Requests, session updates, and milestones. Nothing else.
      </p>
      <div className="mt-8">
        <NotificationList initialNotifications={notifications} />
      </div>
    </div>
  );
}
