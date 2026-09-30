import { NextResponse } from "next/server";
import {
  apiError,
  authenticatedUser,
  rateLimit,
  rejectCrossSiteMutation,
} from "@/lib/api";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const limited = rateLimit(request, "follow", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to follow people.", 401);
  const { id: followingId } = await context.params;
  if (followingId === user.id) return apiError("You cannot follow yourself.");
  if (!(await db.user.findUnique({ where: { id: followingId } })))
    return apiError("Person not found.", 404);
  await db.follow.upsert({
    where: { followerId_followingId: { followerId: user.id, followingId } },
    update: {},
    create: { followerId: user.id, followingId },
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
  const { id: followingId } = await context.params;
  await db.follow.deleteMany({ where: { followerId: user.id, followingId } });
  return NextResponse.json({ following: false });
}
