import { NextResponse } from "next/server";
import {
  apiError,
  authenticatedUser,
  rejectCrossSiteMutation,
} from "@/lib/api";
import { db } from "@/lib/db";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; skillId: string }> },
) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to continue.", 401);
  const { id: userId, skillId } = await context.params;
  if (user.id !== userId)
    return apiError("You can only update your own Skill Wallet.", 403);
  const kind = new URL(request.url).searchParams.get("kind");
  if (!kind || !["TEACH", "LEARN", "CURRENT"].includes(kind))
    return apiError("Choose a valid wallet section.");
  await db.userSkill.deleteMany({ where: { userId, skillId, kind } });
  return NextResponse.json({ ok: true });
}
