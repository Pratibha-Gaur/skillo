import "server-only";
import { db } from "@/lib/db";

export async function getCreditBalance(userId: string) {
  const result = await db.skillCreditTransaction.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function getUnreadNotificationCount(userId: string) {
  return db.notification.count({ where: { userId, readAt: null } });
}

export function exchangeInclude() {
  return {
    proposer: { include: { profile: true } },
    recipient: { include: { profile: true } },
    teachSkill: true,
    learnSkill: true,
    proposal: true,
    plan: { include: { items: { orderBy: { sortOrder: "asc" as const } } } },
    sessions: {
      orderBy: { scheduledFor: "asc" as const },
      include: { tasks: true },
    },
    progress: true,
  };
}
