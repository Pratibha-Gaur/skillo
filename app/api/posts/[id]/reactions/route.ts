import { NextResponse } from "next/server";
import { z } from "zod";
import {
  apiError,
  authenticatedUser,
  rateLimit,
  rejectCrossSiteMutation,
} from "@/lib/api";
import { db } from "@/lib/db";
import { REACTIONS } from "@/lib/constants";

const allowed = REACTIONS.map((reaction) => reaction.value) as [
  string,
  ...string[],
];
const schema = z.object({ type: z.enum(allowed).default("HELPFUL") });

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const limited = rateLimit(request, "react-post", {
    limit: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to react.", 401);
  const { id: postId } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return apiError("Choose a valid reaction.");
  if (
    !(await db.post.findUnique({ where: { id: postId }, select: { id: true } }))
  )
    return apiError("Post not found.", 404);

  const existing = await db.postReaction.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });
  if (existing?.type === parsed.data.type) {
    await db.postReaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ active: false });
  }

  await db.postReaction.upsert({
    where: { postId_userId: { postId, userId: user.id } },
    update: { type: parsed.data.type },
    create: { postId, userId: user.id, type: parsed.data.type },
  });
  return NextResponse.json({ active: true, type: parsed.data.type });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to continue.", 401);
  const { id: postId } = await context.params;
  await db.postReaction.deleteMany({ where: { postId, userId: user.id } });
  return NextResponse.json({ ok: true });
}
