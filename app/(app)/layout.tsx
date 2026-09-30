import { AppShell } from "@/components/layout/app-shell";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCreditBalance, getUnreadNotificationCount } from "@/lib/queries";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOnboardedUser();
  const [skills, unread, credits] = await Promise.all([
    db.skill.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getUnreadNotificationCount(user.id),
    getCreditBalance(user.id),
  ]);

  return (
    <AppShell user={user} skills={skills} unread={unread} credits={credits}>
      {children}
    </AppShell>
  );
}
