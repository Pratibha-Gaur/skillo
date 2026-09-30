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
import { POST_TYPES } from "@/lib/constants";

const allowedTypes = POST_TYPES.map((type) => type.value) as [
  string,
  ...string[],
];
const postSchema = z.object({
  content: z.string().min(3).max(800),
  type: z.enum(allowedTypes),
  skillId: z.string().nullable().optional(),
});

export async function GET() {
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to view the feed.", 401);
  const posts = await db.post.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          profile: {
            select: { name: true, username: true, avatarColor: true },
          },
        },
      },
      skill: true,
      reactions: { select: { userId: true, type: true, createdAt: true } },
    },
  });
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const limited = rateLimit(request, "create-post", {
    limit: 8,
    windowMs: 10 * 60_000,
  });
  if (limited) return limited;
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to post.", 401);

  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiError(
      "Write between 3 and 800 characters and choose a valid post type.",
    );
  const content = cleanText(parsed.data.content, 800);
  if (content.length < 3)
    return apiError("Write a little more before publishing.");

  if (
    parsed.data.skillId &&
    !(await db.skill.findUnique({ where: { id: parsed.data.skillId } }))
  ) {
    return apiError("Choose a valid skill.");
  }

  const post = await db.post.create({
    data: {
      authorId: user.id,
      content,
      type: parsed.data.type,
      skillId: parsed.data.skillId ?? null,
    },
  });
  return NextResponse.json({ post }, { status: 201 });
}
