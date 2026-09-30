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

const schema = z.object({
  receiverId: z.string().min(1),
  exchangeId: z.string().nullable().optional(),
  content: z.string().min(1).max(1000),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "message", {
    limit: 40,
    windowMs: 60_000,
  });
  if (limited) return limited;
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser();
  if (!user) return apiError("Sign in to send a message.", 401);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiError("Write a message up to 1,000 characters.");
  if (parsed.data.receiverId === user.id)
    return apiError("Choose another person.");
  const receiver = await db.user.findUnique({
    where: { id: parsed.data.receiverId },
    include: { profile: true },
  });
  if (!receiver) return apiError("Person not found.", 404);

  if (parsed.data.exchangeId) {
    const exchange = await db.exchange.findUnique({
      where: { id: parsed.data.exchangeId },
    });
    if (
      !exchange ||
      ![exchange.proposerId, exchange.recipientId].includes(user.id) ||
      ![exchange.proposerId, exchange.recipientId].includes(
        parsed.data.receiverId,
      )
    ) {
      return apiError("You cannot message this exchange.", 403);
    }
  }

  const content = cleanText(parsed.data.content, 1000);
  if (!content) return apiError("Write a message before sending.");
  const message = await db.message.create({
    data: {
      senderId: user.id,
      receiverId: parsed.data.receiverId,
      exchangeId: parsed.data.exchangeId ?? null,
      content,
    },
  });
  return NextResponse.json({ message }, { status: 201 });
}
