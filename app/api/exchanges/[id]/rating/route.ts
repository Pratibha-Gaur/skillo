import { NextResponse } from "next/server";
import { z } from "zod";
import {
  apiError,
  authenticatedUser,
  cleanText,
  rejectCrossSiteMutation,
} from "@/lib/api";
import { db } from "@/lib/db";

const score = z.number().int().min(1).max(5);
const schema = z.object({
  teaching: score,
  reliability: score,
  communication: score,
  helpfulness: score,
  respect: score,
  overall: score,
  note: z.string().max(300).default(""),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to continue.", 401);
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Rate each area from 1 to 5.");
  const exchange = await db.exchange.findUnique({ where: { id } });
  if (!exchange) return apiError("Exchange not found.", 404);
  if (exchange.status !== "COMPLETED")
    return apiError("Complete the exchange before leaving a rating.", 409);
  if (exchange.proposerId !== user.id && exchange.recipientId !== user.id)
    return apiError("You are not part of this exchange.", 403);
  const subjectId =
    exchange.proposerId === user.id
      ? exchange.recipientId
      : exchange.proposerId;
  if (
    await db.rating.findUnique({
      where: { exchangeId_authorId: { exchangeId: id, authorId: user.id } },
    })
  )
    return apiError("You already rated this exchange.", 409);
  const rating = await db.rating.create({
    data: {
      exchangeId: id,
      authorId: user.id,
      subjectId,
      ...parsed.data,
      note: cleanText(parsed.data.note, 300),
    },
  });
  await db.notification.create({
    data: {
      userId: subjectId,
      type: "RATING",
      title: "You received exchange feedback",
      body: "New feedback was added to your reputation after a completed exchange.",
      href: "/profile",
    },
  });
  return NextResponse.json({ rating }, { status: 201 });
}
