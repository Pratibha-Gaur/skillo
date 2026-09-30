import { NextResponse } from "next/server";
import {
  apiError,
  authenticatedUser,
  rejectCrossSiteMutation,
} from "@/lib/api";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to continue.", 401);
  const { id } = await context.params;
  const exchange = await db.exchange.findUnique({
    where: { id },
    include: { sessions: true, teachSkill: true, learnSkill: true },
  });
  if (!exchange) return apiError("Exchange not found.", 404);
  if (exchange.proposerId !== user.id && exchange.recipientId !== user.id)
    return apiError("You are not part of this exchange.", 403);
  if (exchange.status !== "ACTIVE")
    return apiError("Only an active exchange can be completed.", 409);
  if (
    !exchange.sessions.length ||
    exchange.sessions.some((session) => !session.learnerConfirmedAt)
  )
    return apiError(
      "Confirm every planned session before completing the exchange.",
      409,
    );
  const otherUserId =
    exchange.proposerId === user.id
      ? exchange.recipientId
      : exchange.proposerId;
  await db.$transaction([
    db.exchange.update({ where: { id }, data: { status: "COMPLETED" } }),
    db.notification.create({
      data: {
        userId: otherUserId,
        type: "MILESTONE",
        title: "Exchange completed",
        body: `${exchange.teachSkill.name} ↔ ${exchange.learnSkill.name} is now part of your learning history.`,
        href: `/exchanges/${id}`,
      },
    }),
  ]);
  return NextResponse.json({ completed: true });
}
