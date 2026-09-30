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
  if (!user) return apiError("Sign in to follow skills.", 401);
  const { id: skillId } = await context.params;
  if (!(await db.skill.findUnique({ where: { id: skillId } })))
    return apiError("Skill not found.", 404);
  await db.skillFollow.upsert({
    where: { userId_skillId: { userId: user.id, skillId } },
    update: {},
    create: { userId: user.id, skillId },
  });
  return NextResponse.json({ following: true });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to continue.", 401);
  const { id: skillId } = await context.params;
  await db.skillFollow.deleteMany({ where: { userId: user.id, skillId } });
  return NextResponse.json({ following: false });
}
