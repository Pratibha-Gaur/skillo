import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Repeat2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PlanReview } from "@/components/exchanges/plan-review";
import { ExchangeWorkspace } from "@/components/exchanges/exchange-workspace";
import { RatingForm } from "@/components/exchanges/rating-form";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Exchange workspace" };

export default async function ExchangePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireOnboardedUser();
  const { id } = await params;
  const exchange = await db.exchange.findUnique({
    where: { id },
    include: {
      proposer: { include: { profile: true } },
      recipient: { include: { profile: true } },
      teachSkill: true,
      learnSkill: true,
      plan: { include: { items: { orderBy: { sortOrder: "asc" } } } },
      sessions: {
        include: { tasks: true },
        orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }],
      },
      progress: { where: { userId: user.id } },
      messages: { orderBy: { createdAt: "asc" } },
      ratings: true,
    },
  });
  if (!exchange) notFound();
  if (exchange.proposerId !== user.id && exchange.recipientId !== user.id)
    notFound();
  if (exchange.status === "PROPOSED") redirect("/exchanges");

  const isProposer = exchange.proposerId === user.id;
  const partnerUser = isProposer ? exchange.recipient : exchange.proposer;
  if (!partnerUser.profile) notFound();
  const partner = {
    id: partnerUser.id,
    name: partnerUser.profile.name,
    avatarColor: partnerUser.profile.avatarColor,
  };
  const ownApproved = isProposer
    ? Boolean(exchange.plan?.proposerApprovedAt)
    : Boolean(exchange.plan?.recipientApprovedAt);
  const partnerApproved = isProposer
    ? Boolean(exchange.plan?.recipientApprovedAt)
    : Boolean(exchange.plan?.proposerApprovedAt);
  const ownRating = exchange.ratings.find(
    (rating) => rating.authorId === user.id,
  );

  return (
    <div className="page-shell py-7 sm:py-10">
      <Link
        href="/exchanges"
        className="inline-flex items-center gap-2 text-sm font-extrabold text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All exchanges
      </Link>
      <header className="mt-6 flex flex-col justify-between gap-5 border-b border-line pb-7 sm:flex-row sm:items-end">
        <div className="flex items-center gap-4">
          <Avatar name={partner.name} color={partner.avatarColor} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
                {exchange.teachSkill.name}{" "}
                <span className="font-semibold text-muted">↔</span>{" "}
                {exchange.learnSkill.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-extrabold ${exchange.status === "ACTIVE" ? "bg-brand-soft text-brand" : exchange.status === "COMPLETED" ? "bg-[#E9EFE8] text-[#466044]" : "bg-[#E8F0F7] text-[#315D83]"}`}
              >
                {exchange.status === "ACTIVE" ? (
                  <Repeat2 className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                {exchange.status === "PLAN_REVIEW"
                  ? "Plan review"
                  : exchange.status === "ACTIVE"
                    ? "Active exchange"
                    : "Completed"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">With {partner.name}</p>
          </div>
        </div>
      </header>

      <div className="mt-8">
        {exchange.status === "PLAN_REVIEW" && exchange.plan && (
          <PlanReview
            exchangeId={exchange.id}
            initialItems={exchange.plan.items.map((item) => ({
              id: item.id,
              week: item.week,
              title: item.title,
              description: item.description,
            }))}
            ownApproved={ownApproved}
            partnerApproved={partnerApproved}
            partnerName={partner.name}
          />
        )}
        {exchange.status === "ACTIVE" && exchange.plan && (
          <ExchangeWorkspace
            exchangeId={exchange.id}
            currentUserId={user.id}
            partner={partner}
            planItems={exchange.plan.items.map((item) => ({
              id: item.id,
              week: item.week,
              title: item.title,
              description: item.description,
              status: item.status,
            }))}
            sessions={exchange.sessions}
            messages={exchange.messages}
            progress={exchange.progress[0]?.percent ?? 0}
          />
        )}
        {exchange.status === "COMPLETED" && (
          <div className="grid gap-8 lg:grid-cols-[1fr_440px]">
            <div className="py-8 text-center lg:py-14">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <h2 className="mt-5 text-2xl font-extrabold tracking-tight">
                Exchange completed
              </h2>
              <p className="mx-auto mt-3 max-w-xl leading-7 text-muted">
                You and {partner.name} finished this exchange. The plan and
                confirmed sessions remain part of your learning history.
              </p>
              <Link
                href={`/profile/${user.profile?.username}`}
                className="mt-6 inline-flex text-sm font-extrabold text-brand hover:text-brand-dark"
              >
                View your progress
              </Link>
            </div>
            <div>
              {ownRating ? (
                <div className="rounded-2xl border border-[#C9DCD1] bg-brand-soft p-6 text-center">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-brand" />
                  <h2 className="mt-3 font-extrabold">Feedback submitted</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Your rating contributes to {partner.name}’s reputation over
                    time.
                  </p>
                </div>
              ) : (
                <RatingForm
                  exchangeId={exchange.id}
                  partnerName={partner.name}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
