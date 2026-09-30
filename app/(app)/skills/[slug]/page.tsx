import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, UsersRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { SkillTag } from "@/components/ui/skill-tag";
import { ToggleAction } from "@/components/ui/toggle-action";
import { buttonClassName } from "@/components/ui/button";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { friendlyLevel } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const skill = await db.skill.findUnique({ where: { slug } });
  return { title: skill?.name ?? "Skill" };
}

export default async function SkillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireOnboardedUser();
  const { slug } = await params;
  const skill = await db.skill.findUnique({
    where: { slug },
    include: {
      subSkills: true,
      followedBy: { where: { userId: user.id } },
      userSkills: {
        where: { kind: "TEACH" },
        include: { user: { include: { profile: true } } },
        take: 8,
      },
      posts: {
        take: 4,
        orderBy: { createdAt: "desc" },
        include: { author: { include: { profile: true } } },
      },
    },
  });
  if (!skill) notFound();
  return (
    <div className="page-shell py-8 sm:py-10">
      <Link
        href="/explore"
        className="inline-flex items-center gap-2 text-sm font-extrabold text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Explore
      </Link>
      <header className="mt-7 grid gap-5 border-b border-line pb-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <SkillTag name={skill.name} category={skill.category} />
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
            Learn {skill.name} with another person.
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            {skill.description}
          </p>
        </div>
        <ToggleAction
          initial={skill.followedBy.length > 0}
          endpoint={`/api/skills/${skill.id}/follow`}
          activeLabel="Following"
          inactiveLabel="Follow skill"
        />
      </header>
      <div className="grid gap-12 py-10 lg:grid-cols-[minmax(0,700px)_1fr]">
        <section>
          <div className="flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-extrabold tracking-tight">
              People who can help
            </h2>
          </div>
          <div className="mt-5 divide-y divide-line border-y border-line">
            {skill.userSkills.map(
              (item) =>
                item.user.profile && (
                  <article
                    key={item.id}
                    className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={item.user.profile.name}
                        color={item.user.profile.avatarColor}
                      />
                      <div>
                        <p className="font-extrabold">
                          {item.user.profile.name}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {friendlyLevel(item.level)}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/profile/${item.user.profile.username}`}
                      className={buttonClassName("secondary")}
                    >
                      View profile
                    </Link>
                  </article>
                ),
            )}
            {!skill.userSkills.length && (
              <p className="py-10 text-center text-sm text-muted">
                No one has added this as a teaching skill yet.
              </p>
            )}
          </div>
        </section>
        <aside>
          {skill.subSkills.length > 0 && (
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="font-extrabold tracking-tight">Ways to begin</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {skill.subSkills.map((subSkill) => (
                  <span
                    key={subSkill.id}
                    className="rounded-lg border border-line bg-[#F3F4F0] px-2.5 py-1.5 text-sm font-bold text-muted"
                  >
                    {subSkill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {skill.posts.length > 0 && (
            <div className="mt-7">
              <h2 className="font-extrabold tracking-tight">
                Recent conversations
              </h2>
              <div className="mt-3 divide-y divide-line border-y border-line">
                {skill.posts.map((post) => (
                  <div key={post.id} className="py-4">
                    <p className="text-sm leading-6 text-ink">{post.content}</p>
                    {post.author.profile && (
                      <p className="mt-2 text-xs font-bold text-muted">
                        {post.author.profile.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
