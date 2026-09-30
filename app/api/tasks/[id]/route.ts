import { NextResponse } from "next/server";
import { z } from "zod";
import {
  apiError,
  authenticatedUser,
  rejectCrossSiteMutation,
} from "@/lib/api";
import { db } from "@/lib/db";

const schema = z.object({
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to continue.", 401);
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Choose a valid task status.");
  const task = await db.sessionTask.findUnique({
    where: { id },
    include: { session: { include: { exchange: true } } },
  });
  if (!task) return apiError("Task not found.", 404);
  const exchange = task.session.exchange;
  if (exchange.proposerId !== user.id && exchange.recipientId !== user.id)
    return apiError("You are not part of this exchange.", 403);
  const updated = await db.sessionTask.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ task: updated });
}
