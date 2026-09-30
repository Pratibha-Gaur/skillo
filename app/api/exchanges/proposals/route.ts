import { NextResponse } from "next/server";
import { z } from "zod";
import {
  apiError,
  authenticatedUser,
  cleanText,
  rateLimit,
  rejectCrossSiteMutation,
} from "@/lib/api";
import { db } from "@/lib/db";

const schema = z.object({
  recipientId: z.string().min(1),
  teachSkillId: z.string().min(1),
  learnSkillId: z.string().min(1),
  sessionCount: z.number().int().min(2).max(8),
  durationMinutes: z.number().int().min(31).max(120),
  note: z.string().max(500).default(""),
  availability: z.string().max(120).default(""),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "exchange-proposal", {
    limit: 8,
    windowMs: 30 * 60_000,
  });
  if (limited) return limited;
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to propose an exchange.", 401);

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiError("Check the exchange details and try again.");
  const data = parsed.data;
  if (data.recipientId === user.id)
    return apiError("Choose another person for this exchange.");
  if (data.teachSkillId === data.learnSkillId)
    return apiError("Choose two different skills.");

  const [recipient, ownTeach, ownLearn, theirTeach, theirLearn] =
    await Promise.all([
      db.user.findUnique({
        where: { id: data.recipientId },
        include: { profile: true },
      }),
      db.userSkill.findUnique({
        where: {
          userId_skillId_kind: {
            userId: user.id,
            skillId: data.teachSkillId,
            kind: "TEACH",
          },
        },
      }),
      db.userSkill.findUnique({
        where: {
          userId_skillId_kind: {
            userId: user.id,
            skillId: data.learnSkillId,
            kind: "LEARN",
          },
        },
      }),
      db.userSkill.findUnique({
        where: {
          userId_skillId_kind: {
            userId: data.recipientId,
            skillId: data.learnSkillId,
            kind: "TEACH",
          },
        },
      }),
      db.userSkill.findUnique({
        where: {
          userId_skillId_kind: {
            userId: data.recipientId,
            skillId: data.teachSkillId,
            kind: "LEARN",
          },
        },
      }),
    ]);
  if (!recipient || !recipient.profile)
    return apiError("Person not found.", 404);
  if (!ownTeach || !ownLearn || !theirTeach || !theirLearn)
    return apiError("These skills no longer form a direct exchange.");

  const existing = await db.exchange.findFirst({
    where: {
      status: { in: ["PROPOSED", "PLAN_REVIEW", "ACTIVE"] },
      OR: [
        {
          proposerId: user.id,
          recipientId: data.recipientId,
          teachSkillId: data.teachSkillId,
          learnSkillId: data.learnSkillId,
        },
        {
          proposerId: data.recipientId,
          recipientId: user.id,
          teachSkillId: data.learnSkillId,
          learnSkillId: data.teachSkillId,
        },
      ],
    },
  });
  if (existing)
    return apiError("You already have an open exchange for these skills.", 409);

  const exchange = await db.exchange.create({
    data: {
      proposerId: user.id,
      recipientId: data.recipientId,
      teachSkillId: data.teachSkillId,
      learnSkillId: data.learnSkillId,
      status: "PROPOSED",
      proposal: {
        create: {
          sessionCount: data.sessionCount,
          durationMinutes: data.durationMinutes,
          note: cleanText(data.note, 500),
          availability: cleanText(data.availability, 120),
        },
      },
    },
    include: { teachSkill: true, learnSkill: true },
  });

  await db.notification.create({
    data: {
      userId: data.recipientId,
      type: "EXCHANGE_REQUEST",
      title: `${user.profile?.name ?? "Someone"} proposed an exchange`,
      body: `${exchange.teachSkill.name} ↔ ${exchange.learnSkill.name}`,
      href: "/exchanges",
    },
  });

  return NextResponse.json(
    { exchangeId: exchange.id, redirectTo: "/exchanges" },
    { status: 201 },
  );
}
