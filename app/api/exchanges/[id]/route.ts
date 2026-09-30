import { NextResponse } from "next/server";
import { z } from "zod";
import {
  apiError,
  authenticatedUser,
  cleanText,
  rejectCrossSiteMutation,
} from "@/lib/api";
import { generateLearningPlan } from "@/lib/ai";
import { db } from "@/lib/db";

const schema = z.object({
  action: z.enum(["ACCEPT", "DECLINE"]),
  reason: z.string().max(120).optional().default(""),
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
  if (!parsed.success) return apiError("Choose accept or decline.");

  const exchange = await db.exchange.findUnique({
    where: { id },
    include: {
      proposal: true,
      teachSkill: true,
      learnSkill: true,
      proposer: { include: { profile: true } },
    },
  });
  if (!exchange) return apiError("Exchange not found.", 404);
  if (exchange.recipientId !== user.id)
    return apiError("Only the recipient can respond to this proposal.", 403);
  if (exchange.status !== "PROPOSED")
    return apiError("This proposal has already been answered.", 409);

  if (parsed.data.action === "DECLINE") {
    await db.$transaction([
      db.exchange.update({ where: { id }, data: { status: "DECLINED" } }),
      db.exchangeProposal.update({
        where: { exchangeId: id },
        data: { privateDeclineReason: cleanText(parsed.data.reason, 120) },
      }),
      db.notification.create({
        data: {
          userId: exchange.proposerId,
          type: "EXCHANGE_DECLINED",
          title: "Exchange request declined",
          body: "That is completely okay. You can keep exploring other matches.",
          href: "/explore",
        },
      }),
    ]);
    return NextResponse.json({ status: "DECLINED" });
  }

  const items = await generateLearningPlan(
    exchange.teachSkill.name,
    exchange.learnSkill.name,
  );
  await db.$transaction([
    db.exchange.update({ where: { id }, data: { status: "PLAN_REVIEW" } }),
    db.learningPlan.create({
      data: {
        exchangeId: id,
        title: `${exchange.teachSkill.name} ↔ ${exchange.learnSkill.name}`,
        items: {
          create: items.map((item, index) => ({
            ...item,
            sortOrder: index + 1,
          })),
        },
      },
    }),
    db.notification.create({
      data: {
        userId: exchange.proposerId,
        type: "PLAN_READY",
        title: "Your exchange was accepted",
        body: `The ${exchange.teachSkill.name} ↔ ${exchange.learnSkill.name} plan is ready to review.`,
        href: `/exchanges/${id}`,
      },
    }),
  ]);

  return NextResponse.json({
    status: "PLAN_REVIEW",
    redirectTo: `/exchanges/${id}`,
  });
}
