import { NextResponse } from "next/server";
import { z } from "zod";
import {
  apiError,
  authenticatedUser,
  rejectCrossSiteMutation,
} from "@/lib/api";
import { db } from "@/lib/db";

const schema = z
  .object({ id: z.string().optional(), all: z.boolean().optional() })
  .refine((data) => data.id || data.all);

export async function PATCH(request: Request) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to continue.", 401);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Choose a notification to update.");
  if (parsed.data.all)
    await db.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
  else
    await db.notification.updateMany({
      where: { id: parsed.data.id, userId: user.id },
      data: { readAt: new Date() },
    });
  return NextResponse.json({ ok: true });
}
