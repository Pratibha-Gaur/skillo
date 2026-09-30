import { NextResponse } from "next/server";
import { z } from "zod";
import {
  apiError,
  authenticatedUser,
  rejectCrossSiteMutation,
} from "@/lib/api";
import { db } from "@/lib/db";

const schema = z.object({ action: z.enum(["MARK_COMPLETE", "CONFIRM"]) });

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
  if (!parsed.success) return apiError("Choose a valid session action.");

  const session = await db.session.findUnique({
    where: { id },
    include: {
      exchange: { include: { teachSkill: true, learnSkill: true } },
      teacher: { include: { profile: true } },
      learner: { include: { profile: true } },
    },
  });
  if (!session) return apiError("Session not found.", 404);
  if (session.durationMinutes <= 30)
    return apiError(
      "A teaching session must last more than 30 minutes before it can be completed.",
    );
  if (session.exchange.status !== "ACTIVE")
    return apiError("This exchange is not active.", 409);

  if (parsed.data.action === "MARK_COMPLETE") {
    if (session.teacherId !== user.id)
      return apiError("Only the teacher can mark this session complete.", 403);
    if (session.scheduledFor && session.scheduledFor > new Date())
      return apiError("This session is still scheduled for the future.", 409);
    if (session.teacherCompletedAt)
      return apiError(
        "This session is already waiting for learner confirmation.",
        409,
      );
    await db.$transaction([
      db.session.update({
        where: { id },
        data: { teacherCompletedAt: new Date() },
      }),
      db.notification.create({
        data: {
          userId: session.learnerId,
          type: "SESSION_COMPLETE",
          title: `${session.teacher.profile?.name ?? "Your teacher"} marked a session complete`,
          body: `Confirm “${session.title}” when you are ready.`,
          href: `/exchanges/${session.exchangeId}`,
        },
      }),
    ]);
    return NextResponse.json({ status: "AWAITING_CONFIRMATION" });
  }

  if (session.learnerId !== user.id)
    return apiError("Only the learner can confirm this session.", 403);
  if (!session.teacherCompletedAt)
    return apiError(
      "The teacher needs to mark this session complete first.",
      409,
    );
  if (session.learnerConfirmedAt || session.creditAwardedAt)
    return apiError("This session has already been confirmed.", 409);

  const progress = await db.progress.findFirst({
    where: { exchangeId: session.exchangeId, userId: session.learnerId },
  });
  const learnedSkillId =
    session.learnerId === session.exchange.proposerId
      ? session.exchange.learnSkillId
      : session.exchange.teachSkillId;
  const now = new Date();
  try {
    await db.$transaction([
      db.session.update({
        where: { id },
        data: { learnerConfirmedAt: now, creditAwardedAt: now },
      }),
      db.skillCreditTransaction.create({
        data: {
          userId: session.teacherId,
          sessionId: id,
          amount: 1,
          type: "EARNED_TEACHING",
          reason: `Completed teaching session: ${session.title}`,
        },
      }),
      progress
        ? db.progress.update({
            where: { id: progress.id },
            data: { percent: Math.min(100, progress.percent + 15) },
          })
        : db.progress.create({
            data: {
              userId: session.learnerId,
              exchangeId: session.exchangeId,
              skillId: learnedSkillId,
              percent: 15,
              note: "First session confirmed.",
            },
          }),
      db.notification.create({
        data: {
          userId: session.teacherId,
          type: "SKILL_CREDIT",
          title: "You earned a Skill Credit",
          body: `${session.learner.profile?.name ?? "Your learner"} confirmed “${session.title}”.`,
          href: `/exchanges/${session.exchangeId}`,
        },
      }),
    ]);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return apiError("This session has already been confirmed.", 409);
    }
    throw error;
  }

  return NextResponse.json({
    status: "COMPLETED",
    creditAwarded: true,
    teacherName: session.teacher.profile?.name ?? "Your teacher",
  });
}
