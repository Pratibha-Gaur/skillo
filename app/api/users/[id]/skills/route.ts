import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeSkill } from "@/lib/ai";
import {
  apiError,
  authenticatedUser,
  cleanText,
  rejectCrossSiteMutation,
} from "@/lib/api";
import { db } from "@/lib/db";

const schema = z.object({
  skillId: z.string().optional(),
  customName: z.string().max(60).optional(),
  kind: z.enum(["TEACH", "LEARN", "CURRENT"]),
  level: z.enum(["BASICS", "COMFORTABLE", "VERY_STRONG"]).default("BASICS"),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to continue.", 401);
  const { id: userId } = await context.params;
  if (user.id !== userId)
    return apiError("You can only update your own Skill Wallet.", 403);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || (!parsed.data.skillId && !parsed.data.customName))
    return apiError("Choose or name a skill.");

  let skillId = parsed.data.skillId;
  if (skillId && !(await db.skill.findUnique({ where: { id: skillId } })))
    return apiError("Skill not found.", 404);
  if (!skillId && parsed.data.customName) {
    const analyzed = analyzeSkill(cleanText(parsed.data.customName, 60));
    if (analyzed.name.length < 2) return apiError("Enter a clear skill name.");
    const skill = await db.skill.upsert({
      where: { slug: analyzed.slug },
      update: {},
      create: {
        name: analyzed.name,
        slug: analyzed.slug,
        category: "Other",
        description: `Learn and share practical ${analyzed.name} skills.`,
      },
    });
    skillId = skill.id;
  }
  if (!skillId) return apiError("Choose a skill.");

  const userSkill = await db.userSkill.upsert({
    where: { userId_skillId_kind: { userId, skillId, kind: parsed.data.kind } },
    update: { level: parsed.data.level },
    create: {
      userId,
      skillId,
      kind: parsed.data.kind,
      level: parsed.data.level,
    },
  });
  return NextResponse.json({ userSkill }, { status: 201 });
}
