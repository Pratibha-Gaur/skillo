import { NextResponse } from "next/server";
import {
  apiError,
  authenticatedUser,
  rejectCrossSiteMutation,
} from "@/lib/api";
import { db } from "@/lib/db";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to continue.", 401);
  const { id } = await context.params;
  const post = await db.post.findUnique({ where: { id } });
  if (!post) return apiError("Post not found.", 404);
  if (
    post.authorId !== user.id &&
    user.role !== "ADMIN" &&
    user.role !== "MODERATOR"
  ) {
    return apiError("You can only remove your own posts.", 403);
  }
  await db.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
