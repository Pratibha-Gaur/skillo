import { NextResponse } from "next/server";
import { z } from "zod";
import {
  apiError,
  authenticatedUser,
  cleanText,
  rejectCrossSiteMutation,
} from "@/lib/api";
import { db } from "@/lib/db";

const itemSchema = z.object({
  id: z.string(),
  title: z.string().min(2).max(100),
  description: z.string().min(2).max(350),
});
const schema = z.object({
  action: z.enum(["APPROVE", "UPDATE"]),
  items: z.array(itemSchema).max(8).optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to continue.", 401);
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiError("Check the learning plan and try again.");

  const exchange = await db.exchange.findUnique({
    where: { id },
    include: {
      plan: { include: { items: true } },
      proposal: true,
      teachSkill: true,
      learnSkill: true,
    },
  });
  if (!exchange || !exchange.plan)
    return apiError("Learning plan not found.", 404);
  if (exchange.proposerId !== user.id && exchange.recipientId !== user.id)
    return apiError("You are not part of this exchange.", 403);
  if (exchange.status !== "PLAN_REVIEW")
    return apiError("This learning plan is no longer awaiting approval.", 409);

  if (parsed.data.action === "UPDATE") {
    if (!parsed.data.items?.length)
      return apiError("Include at least one plan item.");
    const validIds = new Set(exchange.plan.items.map((item) => item.id));
    if (parsed.data.items.some((item) => !validIds.has(item.id)))
      return apiError("A plan item is not valid.");
    await db.$transaction([
      ...parsed.data.items.map((item) =>
        db.learningPlanItem.update({
          where: { id: item.id },
          data: {
            title: cleanText(item.title, 100),
            description: cleanText(item.description, 350),
          },
        }),
      ),
      db.learningPlan.update({
        where: { id: exchange.plan.id },
        data: { proposerApprovedAt: null, recipientApprovedAt: null },
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  const approvalField =
    exchange.proposerId === user.id
      ? "proposerApprovedAt"
      : "recipientApprovedAt";
  const plan = await db.learningPlan.update({
    where: { id: exchange.plan.id },
    data: { [approvalField]: new Date() },
  });
  const bothApproved = Boolean(
    plan.proposerApprovedAt && plan.recipientApprovedAt,
  );

  if (bothApproved) {
    const day = 24 * 60 * 60 * 1000;
    const sessionCount = exchange.proposal?.sessionCount ?? 4;
    const durationMinutes = exchange.proposal?.durationMinutes ?? 45;
    const sessions = Array.from({ length: sessionCount }, (_, index) => {
      const proposerTeaches = index % 2 === 0;
      const skillName = proposerTeaches
        ? exchange.teachSkill.name
        : exchange.learnSkill.name;
      return {
        exchangeId: id,
        teacherId: proposerTeaches ? exchange.proposerId : exchange.recipientId,
        learnerId: proposerTeaches ? exchange.recipientId : exchange.proposerId,
        title: `${skillName}: ${index < 2 ? "foundations" : "guided practice"}`,
        durationMinutes,
        scheduledFor: new Date(Date.now() + (3 + index * 7) * day),
      };
    });
    await db.$transaction([
      db.exchange.update({ where: { id }, data: { status: "ACTIVE" } }),
      db.session.createMany({ data: sessions }),
      db.notification.create({
        data: {
          userId:
            exchange.proposerId === user.id
              ? exchange.recipientId
              : exchange.proposerId,
          type: "EXCHANGE_ACTIVE",
          title: "Your exchange is active",
          body: `${exchange.teachSkill.name} ↔ ${exchange.learnSkill.name}`,
          href: `/exchanges/${id}`,
        },
      }),
    ]);
  }

  return NextResponse.json({ approved: true, active: bothApproved });
}
