import { NextResponse } from "next/server";
import { z } from "zod";
import {
  apiError,
  authenticatedUser,
  rejectCrossSiteMutation,
} from "@/lib/api";
import { db } from "@/lib/db";

const schema = z.object({
  teachSkillId: z.string().min(1),
  learnSkillId: z.string().min(1),
});

export async function POST(request: Request) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to continue.", 401);

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (
    !parsed.success ||
    parsed.data.teachSkillId === parsed.data.learnSkillId
  ) {
    return apiError("Choose two different skills.");
  }

  const count = await db.skill.count({
    where: { id: { in: [parsed.data.teachSkillId, parsed.data.learnSkillId] } },
  });
  if (count !== 2) return apiError("Choose skills from the list.");

  await db.$transaction([
    db.userSkill.upsert({
      where: {
        userId_skillId_kind: {
          userId: user.id,
          skillId: parsed.data.teachSkillId,
          kind: "TEACH",
        },
      },
      update: {},
      create: {
        userId: user.id,
        skillId: parsed.data.teachSkillId,
        kind: "TEACH",
        level: "BASICS",
      },
    }),
    db.userSkill.upsert({
      where: {
        userId_skillId_kind: {
          userId: user.id,
          skillId: parsed.data.learnSkillId,
          kind: "LEARN",
        },
      },
      update: {},
      create: {
        userId: user.id,
        skillId: parsed.data.learnSkillId,
        kind: "LEARN",
        level: "BASICS",
      },
    }),
    db.profile.update({
      where: { userId: user.id },
      data: { onboardingComplete: true },
    }),
  ]);

  return NextResponse.json({ ok: true, redirectTo: "/home" });
}
