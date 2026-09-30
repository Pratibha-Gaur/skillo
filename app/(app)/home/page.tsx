import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2, Repeat2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { buttonClassName } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SkillTag } from "@/components/ui/skill-tag";
import { PostCard } from "@/components/posts/post-card";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Home" };

export default async function HomePage() {
  const user = await requireOnboardedUser();
  const firstName = user.profile?.name.split(" ")[0] ?? "there";

  const [posts, activeExchange, people, ownSkills] = await Promise.all([
    db.post.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        author: { include: { profile: true } },
        skill: true,
        reactions: true,
      },
    }),
    db.exchange.findFirst({
      where: {
        status: "ACTIVE",
        OR: [{ proposerId: user.id }, { recipientId: user.id }],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        proposer: { include: { profile: true } },
        recipient: { include: { profile: true } },
        teachSkill: true,
        learnSkill: true,
        sessions: { orderBy: { scheduledFor: "asc" } },
        progress: { where: { userId: user.id } },
      },
    }),
    db.user.findMany({
      where: { id: { not: user.id } },
      include: { profile: true, skills: { include: { skill: true } } },
    }),
    db.userSkill.findMany({
      where: { userId: user.id },
      include: { skill: true },
    }),
  ]);

  const teachIds = new Set(
    ownSkills
      .filter((item) => item.kind === "TEACH")
      .map((item) => item.skillId),
  );
  const learnIds = new Set(
    ownSkills
      .filter((item) => item.kind === "LEARN")
      .map((item) => item.skillId),
  );
  const match = people.find((person) => {
    const theirTeach = person.skills.some(
      (item) => item.kind === "TEACH" && learnIds.has(item.skillId),
    );
    const theirLearn = person.skills.some(
      (item) => item.kind === "LEARN" && teachIds.has(item.skillId),
    );
    return theirTeach && theirLearn;
  });
  const matchTeach = match?.skills.find(
    (item) => item.kind === "TEACH" && learnIds.has(item.skillId),
  );
  const matchLearn = match?.skills.find(
    (item) => item.kind === "LEARN" && teachIds.has(item.skillId),
  );

  const partner = activeExchange
    ? activeExchange.proposerId === user.id
      ? activeExchange.recipient
      : activeExchange.proposer
    : null;
  const pendingConfirmation = activeExchange?.sessions.find(
    (session) =>
      session.learnerId === user.id &&
      session.teacherCompletedAt &&
      !session.learnerConfirmedAt,
  );
  const nextSession = activeExchange?.sessions.find(
    (session) =>
      !session.teacherCompletedAt &&
      session.scheduledFor &&
      session.scheduledFor > new Date(),
  );
  const progress = activeExchange?.progress[0]?.percent ?? 0;

  return (
    <div className="page-shell py-8 sm:py-10">
      <div className="mb-8">
        <p className="text-sm font-bold text-muted">
          Welcome back, {firstName}.
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
          Here is what matters today.
        </h1>
      </div>

      {activeExchange && partner?.profile && (
        <section
          className="mb-10 overflow-hidden rounded-2xl border border-[#C9DCD1] bg-[#EDF5F0]"
          aria-labelledby="active-exchange-heading"
        >
          <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex gap-4">
              <Avatar
                name={partner.profile.name}
                color={partner.profile.avatarColor}
                size="lg"
              />
              <div>
                <p className="text-sm font-extrabold text-brand">
                  Your active exchange
                </p>
                <h2
                  id="active-exchange-heading"
                  className="mt-1 text-xl font-extrabold tracking-tight"
                >
                  {activeExchange.teachSkill.name}{" "}
                  <span className="font-semibold text-muted">↔</span>{" "}
                  {activeExchange.learnSkill.name}
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  With {partner.profile.name}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:flex-row md:items-center">
              {pendingConfirmation && (
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[#7A5A12]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Session ready to confirm
                </span>
              )}
              {!pendingConfirmation && nextSession && (
                <span className="inline-flex items-center gap-2 text-sm font-bold text-muted">
                  <CalendarClock className="h-4 w-4" aria-hidden="true" />
                  Next session is planned
                </span>
              )}
              <Link
                href={`/exchanges/${activeExchange.id}`}
                className={buttonClassName("primary")}
              >
                {pendingConfirmation ? "Review session" : "Open workspace"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="border-t border-[#C9DCD1] bg-white/55 px-5 py-4 sm:px-6">
            <ProgressBar
              value={progress}
              label={`Your ${activeExchange.learnSkill.name} progress`}
            />
          </div>
        </section>
      )}

      <div className="grid gap-12 lg:grid-cols-[minmax(0,700px)_minmax(260px,1fr)] lg:gap-14">
        <section aria-labelledby="feed-heading">
          <div className="flex items-end justify-between border-b border-line pb-4">
            <div>
              <p className="text-sm font-extrabold text-brand">For you</p>
              <h2
                id="feed-heading"
                className="mt-1 text-2xl font-extrabold tracking-tight"
              >
                Learning in progress
              </h2>
            </div>
            <Link
              href="/explore"
              className="hidden text-sm font-bold text-muted hover:text-ink sm:inline-flex"
            >
              Explore more
            </Link>
          </div>
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={user.id} />
            ))}
          </div>
        </section>

        <aside className="space-y-9 lg:pt-1">
          {match?.profile && matchTeach && matchLearn && (
            <section aria-labelledby="match-heading">
              <div className="flex items-center justify-between">
                <h2
                  id="match-heading"
                  className="text-lg font-extrabold tracking-tight"
                >
                  Someone worth meeting
                </h2>
                <Repeat2 className="h-5 w-5 text-brand" aria-hidden="true" />
              </div>
              <div className="mt-4 border-y border-line py-5">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={match.profile.name}
                    color={match.profile.avatarColor}
                    size="lg"
                  />
                  <div>
                    <p className="font-extrabold">{match.profile.name}</p>
                    <p className="mt-0.5 text-sm text-muted">
                      Direct skill match
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <SkillTag
                    name={matchTeach.skill.name}
                    category={matchTeach.skill.category}
                  />
                  <span className="font-bold text-muted">↔</span>
                  <SkillTag
                    name={matchLearn.skill.name}
                    category={matchLearn.skill.category}
                  />
                </div>
                <p className="mt-4 text-sm leading-6 text-muted">
                  {match.profile.name.split(" ")[0]} can help with{" "}
                  {matchTeach.skill.name} and wants to learn{" "}
                  {matchLearn.skill.name}.
                </p>
                <Link
                  href={`/profile/${match.profile.username}`}
                  className={buttonClassName("secondary", "mt-4 w-full")}
                >
                  View profile
                </Link>
              </div>
              <Link
                href="/explore"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-extrabold text-brand hover:text-brand-dark"
              >
                See more people
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </section>
          )}

          <section aria-labelledby="wallet-quick-heading">
            <h2
              id="wallet-quick-heading"
              className="text-lg font-extrabold tracking-tight"
            >
              Your focus
            </h2>
            <div className="mt-4 space-y-4 border-y border-line py-5">
              <div>
                <p className="text-sm font-bold text-muted">
                  You can help with
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ownSkills
                    .filter((item) => item.kind === "TEACH")
                    .slice(0, 2)
                    .map((item) => (
                      <SkillTag
                        key={item.id}
                        name={item.skill.name}
                        category={item.skill.category}
                      />
                    ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-muted">
                  You want to learn
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ownSkills
                    .filter((item) => item.kind === "LEARN")
                    .slice(0, 2)
                    .map((item) => (
                      <SkillTag
                        key={item.id}
                        name={item.skill.name}
                        category={item.skill.category}
                      />
                    ))}
                </div>
              </div>
            </div>
            <Link
              href={`/profile/${user.profile?.username}`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-extrabold text-brand hover:text-brand-dark"
            >
              Open Skill Wallet
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
