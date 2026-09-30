import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { SkillTag } from "@/components/ui/skill-tag";
import { AddSkillModal } from "@/components/profile/add-skill-modal";
import {
  OtherProfileActions,
  OwnProfileActions,
} from "@/components/profile/profile-actions";
import { RemoveSkillButton } from "@/components/profile/remove-skill-button";
import { ProposalModal } from "@/components/exchanges/proposal-modal";
import { PostCard } from "@/components/posts/post-card";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { friendlyLevel, titleCase } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await db.profile.findUnique({ where: { username } });
  return {
    title: profile?.name ?? "Profile",
    description: profile?.bio || `View @${username} on Skillo.`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const currentUser = await requireOnboardedUser();
  const { username } = await params;
  const viewed = await db.user.findFirst({
    where: { profile: { is: { username } } },
    include: {
      profile: true,
      skills: { include: { skill: true }, orderBy: { createdAt: "asc" } },
      creditTransactions: { orderBy: { createdAt: "desc" } },
      ratingsReceived: true,
      posts: {
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          author: { include: { profile: true } },
          skill: true,
          reactions: true,
        },
      },
      followers: { where: { followerId: currentUser.id } },
      proposedExchanges: {
        where: { status: "COMPLETED" },
        include: {
          recipient: { include: { profile: true } },
          teachSkill: true,
          learnSkill: true,
        },
      },
      receivedExchanges: {
        where: { status: "COMPLETED" },
        include: {
          proposer: { include: { profile: true } },
          teachSkill: true,
          learnSkill: true,
        },
      },
    },
  });
  if (!viewed?.profile) notFound();

  const isOwn = viewed.id === currentUser.id;
  const allSkills = await db.skill.findMany({
    select: { id: true, name: true, category: true },
    orderBy: { name: "asc" },
  });
  const currentSkills = isOwn
    ? viewed.skills
    : await db.userSkill.findMany({
        where: { userId: currentUser.id },
        include: { skill: true },
      });
  const teachOptions = isOwn
    ? []
    : currentSkills
        .filter(
          (item) =>
            item.kind === "TEACH" &&
            viewed.skills.some(
              (other) =>
                other.kind === "LEARN" && other.skillId === item.skillId,
            ),
        )
        .map((item) => item.skill);
  const learnOptions = isOwn
    ? []
    : currentSkills
        .filter(
          (item) =>
            item.kind === "LEARN" &&
            viewed.skills.some(
              (other) =>
                other.kind === "TEACH" && other.skillId === item.skillId,
            ),
        )
        .map((item) => item.skill);
  const directMatch = teachOptions.length > 0 && learnOptions.length > 0;
  const credits = viewed.creditTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );
  const completed = [...viewed.proposedExchanges, ...viewed.receivedExchanges];
  const rating = viewed.ratingsReceived.length
    ? viewed.ratingsReceived.reduce((total, item) => total + item.overall, 0) /
      viewed.ratingsReceived.length
    : null;
  const walletSections = [
    {
      kind: "TEACH",
      label: "Can teach",
      description: "Skills they can help another person practice.",
    },
    {
      kind: "LEARN",
      label: "Wants to learn",
      description: "Skills they are looking for help with.",
    },
    {
      kind: "CURRENT",
      label: "Currently learning",
      description: "Active learning journeys.",
    },
  ];

  return (
    <div className="page-shell py-8 sm:py-10">
      <header className="grid gap-7 border-b border-line pb-9 md:grid-cols-[auto_1fr_auto] md:items-start">
        <Avatar
          name={viewed.profile.name}
          color={viewed.profile.avatarColor}
          size="xl"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
              {viewed.profile.name}
            </h1>
            <span className="rounded-md bg-[#E9EFE8] px-2 py-1 text-xs font-extrabold text-[#466044]">
              {titleCase(viewed.profile.platformLevel)}
            </span>
            {directMatch && (
              <span className="rounded-md bg-brand-soft px-2 py-1 text-xs font-extrabold text-brand">
                Direct skill match
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-semibold text-muted">
            @{viewed.profile.username}
          </p>
          {viewed.profile.bio ? (
            <p className="mt-4 max-w-2xl leading-7 text-ink">
              {viewed.profile.bio}
            </p>
          ) : isOwn ? (
            <p className="mt-4 text-muted">
              Add a short note about what you enjoy teaching and learning.
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-muted">
            {viewed.profile.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {viewed.profile.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <span className="text-sun" aria-hidden="true">
                ✦
              </span>
              {credits} Skill {credits === 1 ? "Credit" : "Credits"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {isOwn ? (
            <OwnProfileActions
              userId={viewed.id}
              initial={{
                name: viewed.profile.name,
                bio: viewed.profile.bio,
                location: viewed.profile.location,
              }}
            />
          ) : (
            <>
              <OtherProfileActions
                userId={viewed.id}
                following={viewed.followers.length > 0}
              />
              {directMatch && (
                <ProposalModal
                  person={{ id: viewed.id, name: viewed.profile.name }}
                  teachOptions={teachOptions}
                  learnOptions={learnOptions}
                />
              )}
            </>
          )}
        </div>
      </header>

      <section
        className="grid gap-6 border-b border-line py-8 sm:grid-cols-3"
        aria-label="Reputation overview"
      >
        <div>
          <div className="flex items-center gap-2 text-muted">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-bold">Completed exchanges</span>
          </div>
          <p className="mt-2 text-2xl font-extrabold tabular-nums">
            {completed.length}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-muted">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm font-bold">Reliability</span>
          </div>
          <p className="mt-2 text-2xl font-extrabold tabular-nums">
            {viewed.profile.reliability}%
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-muted">
            <Award className="h-4 w-4" />
            <span className="text-sm font-bold">Overall experience</span>
          </div>
          <p className="mt-2 text-2xl font-extrabold tabular-nums">
            {rating ? `${rating.toFixed(1)} / 5` : "Not rated yet"}
          </p>
          {rating && (
            <p className="mt-1 text-xs text-muted">
              From {viewed.ratingsReceived.length} completed{" "}
              {viewed.ratingsReceived.length === 1 ? "exchange" : "exchanges"}
            </p>
          )}
        </div>
      </section>

      <section className="py-10" aria-labelledby="wallet-heading">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-extrabold text-brand">Skill Wallet</p>
            <h2
              id="wallet-heading"
              className="mt-1 text-2xl font-extrabold tracking-tight"
            >
              What{" "}
              {isOwn
                ? "you bring"
                : viewed.profile.name.split(" ")[0] + " brings"}{" "}
              to Skillo
            </h2>
          </div>
          {isOwn && <AddSkillModal userId={viewed.id} skills={allSkills} />}
        </div>
        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {walletSections.map((section) => {
            const sectionSkills = viewed.skills.filter(
              (item) => item.kind === section.kind,
            );
            return (
              <div
                key={section.kind}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <h3 className="font-extrabold tracking-tight">
                  {section.label}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {section.description}
                </p>
                <div className="mt-5 space-y-3">
                  {sectionSkills.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 border-t border-line pt-3 first:border-0 first:pt-0"
                    >
                      <Link
                        href={`/skills/${item.skill.slug}`}
                        className="group"
                      >
                        <SkillTag
                          name={item.skill.name}
                          category={item.skill.category}
                        />
                        <span className="mt-1.5 block text-xs font-semibold text-muted group-hover:text-ink">
                          {friendlyLevel(item.level)}
                        </span>
                      </Link>
                      {isOwn && (
                        <RemoveSkillButton
                          userId={viewed.id}
                          skillId={item.skillId}
                          kind={item.kind}
                          name={item.skill.name}
                        />
                      )}
                    </div>
                  ))}
                  {!sectionSkills.length && (
                    <p className="text-sm italic text-muted">
                      Nothing here yet.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {completed.length > 0 && (
        <section
          className="border-t border-line py-10"
          aria-labelledby="history-heading"
        >
          <h2
            id="history-heading"
            className="text-2xl font-extrabold tracking-tight"
          >
            Completed exchanges
          </h2>
          <div className="mt-5 divide-y divide-line border-y border-line">
            {completed.map((exchange) => {
              const other =
                exchange.proposerId === viewed.id
                  ? "recipient" in exchange
                    ? exchange.recipient
                    : null
                  : "proposer" in exchange
                    ? exchange.proposer
                    : null;
              return (
                <div
                  key={exchange.id}
                  className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-extrabold">
                      {exchange.teachSkill.name}{" "}
                      <span className="text-muted">↔</span>{" "}
                      {exchange.learnSkill.name}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      With {other?.profile?.name ?? "a Skillo member"}
                    </p>
                  </div>
                  <Link
                    href={`/exchanges/${exchange.id}`}
                    className="text-sm font-extrabold text-brand hover:text-brand-dark"
                  >
                    View exchange
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {viewed.posts.length > 0 && (
        <section
          className="border-t border-line py-10"
          aria-labelledby="posts-heading"
        >
          <h2
            id="posts-heading"
            className="text-2xl font-extrabold tracking-tight"
          >
            Useful posts
          </h2>
          <div className="mt-5 max-w-3xl">
            {viewed.posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser.id}
              />
            ))}
          </div>
        </section>
      )}

      {isOwn && viewed.creditTransactions.length > 0 && (
        <details className="border-t border-line py-8">
          <summary className="cursor-pointer list-none font-extrabold text-brand">
            View Skill Credit activity
          </summary>
          <div className="mt-5 max-w-2xl divide-y divide-line border-y border-line">
            {viewed.creditTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="text-sm font-bold text-ink">
                    {transaction.reason}
                  </p>
                  <time className="mt-1 block text-xs text-muted">
                    {new Intl.DateTimeFormat("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(transaction.createdAt)}
                  </time>
                </div>
                <span
                  className={`font-extrabold tabular-nums ${transaction.amount > 0 ? "text-brand" : "text-muted"}`}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
