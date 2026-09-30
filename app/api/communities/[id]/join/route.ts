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
  if (!user) return apiError("Sign in to join communities.", 401);
  const { id: communityId } = await context.params;
  if (!(await db.community.findUnique({ where: { id: communityId } })))
    return apiError("Community not found.", 404);
  await db.communityMember.upsert({
    where: { communityId_userId: { communityId, userId: user.id } },
    update: {},
    create: { communityId, userId: user.id },
  });
  return NextResponse.json({ joined: true });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to continue.", 401);
  const { id: communityId } = await context.params;
  const membership = await db.communityMember.findUnique({
    where: { communityId_userId: { communityId, userId: user.id } },
  });
  if (membership?.role === "CREATOR")
    return apiError("Community creators cannot leave their own community.");
  await db.communityMember.deleteMany({
    where: { communityId, userId: user.id },
  });
  return NextResponse.json({ joined: false });
}
