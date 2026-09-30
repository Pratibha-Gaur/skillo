import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Compass,
  FileCheck2,
  Inbox,
  Repeat2,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { buttonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProposalResponse } from "@/components/exchanges/proposal-response";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { relativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Exchanges" };

const statusDetails: Record<
  string,
  { label: string; className: string; icon: typeof Clock3 }
> = {
  PROPOSED: {
    label: "Awaiting response",
    className: "bg-[#F9F1D9] text-[#765817]",
    icon: Clock3,
  },
  PLAN_REVIEW: {
    label: "Plan needs approval",
    className: "bg-[#E8F0F7] text-[#315D83]",
    icon: FileCheck2,
  },
  ACTIVE: {
    label: "Active",
    className: "bg-brand-soft text-brand",
    icon: Repeat2,
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-[#E9EFE8] text-[#466044]",
    icon: CheckCircle2,
  },
  DECLINED: {
    label: "Declined",
    className: "bg-[#F1F1ED] text-muted",
    icon: CheckCircle2,
  },
};

export default async function ExchangesPage() {
  const user = await requireOnboardedUser();
  const exchanges = await db.exchange.findMany({
    where: { OR: [{ proposerId: user.id }, { recipientId: user.id }] },
    orderBy: { updatedAt: "desc" },
    include: {
      proposer: { include: { profile: true } },
      recipient: { include: { profile: true } },
      teachSkill: true,
      learnSkill: true,
      proposal: true,
      plan: true,
      sessions: true,
    },
  });
  const current = exchanges.filter((exchange) =>
    ["PROPOSED", "PLAN_REVIEW", "ACTIVE"].includes(exchange.status),
  );
  const past = exchanges.filter((exchange) =>
    ["COMPLETED", "DECLINED"].includes(exchange.status),
  );

  return (
    <div className="page-shell py-8 sm:py-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-extrabold text-brand">Exchanges</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
            Learn something. Share something.
          </h1>
          <p className="mt-3 max-w-xl leading-7 text-muted">
            Manage requests, approve plans, and return to your active
            workspaces.
          </p>
        </div>
        <Link
          href="/explore"
          className={buttonClassName("primary", "shrink-0")}
        >
          Find an exchange
          <Compass className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {current.length ? (
        <section className="mt-10" aria-labelledby="current-heading">
          <h2
            id="current-heading"
            className="text-xl font-extrabold tracking-tight"
          >
            Current
          </h2>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {current.map((exchange) => {
              const partner =
                exchange.proposerId === user.id
                  ? exchange.recipient
                  : exchange.proposer;
              if (!partner.profile) return null;
              const incoming =
                exchange.status === "PROPOSED" &&
                exchange.recipientId === user.id;
              const detail =
                statusDetails[exchange.status] ?? statusDetails.PROPOSED;
              const StatusIcon = detail.icon;
              return (
                <article
                  key={exchange.id}
                  className="grid gap-5 py-6 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div className="flex gap-4">
                    <Avatar
                      name={partner.profile.name}
                      color={partner.profile.avatarColor}
                      size="lg"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-extrabold tracking-tight">
                          {exchange.teachSkill.name}{" "}
                          <span className="font-semibold text-muted">↔</span>{" "}
                          {exchange.learnSkill.name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-extrabold ${detail.className}`}
                        >
                          <StatusIcon
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          {detail.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        With {partner.profile.name} · updated{" "}
                        {relativeTime(exchange.updatedAt)}
                      </p>
                      {incoming && exchange.proposal?.note && (
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink">
                          “{exchange.proposal.note}”
                        </p>
                      )}
                      {exchange.status === "PROPOSED" && !incoming && (
                        <p className="mt-3 text-sm leading-6 text-muted">
                          Your proposal is with {partner.profile.name}. No
                          action is needed right now.
                        </p>
                      )}
                      {exchange.status === "PLAN_REVIEW" && (
                        <p className="mt-3 text-sm leading-6 text-muted">
                          The learning plan is ready. Both people need to
                          approve it before the workspace becomes active.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="md:justify-self-end">
                    {incoming ? (
                      <ProposalResponse exchangeId={exchange.id} />
                    ) : exchange.status === "PROPOSED" ? (
                      <Link
                        href={`/profile/${partner.profile.username}`}
                        className={buttonClassName("secondary")}
                      >
                        View profile
                      </Link>
                    ) : (
                      <Link
                        href={`/exchanges/${exchange.id}`}
                        className={buttonClassName("primary")}
                      >
                        {exchange.status === "ACTIVE"
                          ? "Open workspace"
                          : "Review plan"}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="mt-10">
          <EmptyState
            icon={Inbox}
            title="No exchanges yet"
            body="Find someone who knows what you want to learn and see whether your skills fit together."
            action={
              <Link href="/explore" className={buttonClassName("primary")}>
                Explore people
              </Link>
            }
          />
        </div>
      )}

      {past.length > 0 && (
        <section className="mt-12" aria-labelledby="past-heading">
          <h2
            id="past-heading"
            className="text-xl font-extrabold tracking-tight"
          >
            Past exchanges
          </h2>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {past.map((exchange) => {
              const partner =
                exchange.proposerId === user.id
                  ? exchange.recipient
                  : exchange.proposer;
              if (!partner.profile) return null;
              const detail = statusDetails[exchange.status];
              return (
                <article
                  key={exchange.id}
                  className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={partner.profile.name}
                      color={partner.profile.avatarColor}
                    />
                    <div>
                      <h3 className="font-extrabold">
                        {exchange.teachSkill.name}{" "}
                        <span className="text-muted">↔</span>{" "}
                        {exchange.learnSkill.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        With {partner.profile.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-extrabold ${detail.className}`}
                    >
                      {detail.label}
                    </span>
                    {exchange.status === "COMPLETED" && (
                      <Link
                        href={`/exchanges/${exchange.id}`}
                        className="text-sm font-extrabold text-brand hover:text-brand-dark"
                      >
                        View summary
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
