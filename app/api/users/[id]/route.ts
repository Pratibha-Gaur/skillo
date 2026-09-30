import { NextResponse } from "next/server";
import { z } from "zod";
import {
  apiError,
  authenticatedUser,
  cleanText,
  rejectCrossSiteMutation,
} from "@/lib/api";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2).max(60),
  bio: z.string().max(240),
  location: z.string().max(60),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const user = await db.user.findUnique({
    where: { id },
    include: { profile: true, skills: { include: { skill: true } } },
  });
  if (!user?.profile) return apiError("Profile not found.", 404);
  return NextResponse.json({
    user: { id: user.id, profile: user.profile, skills: user.skills },
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to continue.", 401);
  const { id } = await context.params;
  if (user.id !== id)
    return apiError("You can only edit your own profile.", 403);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiError("Check your profile details and try again.");
  const profile = await db.profile.update({
    where: { userId: id },
    data: {
      name: cleanText(parsed.data.name, 60),
      bio: cleanText(parsed.data.bio, 240),
      location: cleanText(parsed.data.location, 60),
    },
  });
  return NextResponse.json({ profile });
}
