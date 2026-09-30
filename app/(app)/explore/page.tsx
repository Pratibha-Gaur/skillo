import type { Metadata } from "next";
import { ExploreBrowser } from "@/components/explore/explore-browser";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Explore" };

const publicProfileSelect = {
  name: true,
  username: true,
  avatarColor: true,
  bio: true,
} as const;

const publicSkillSelect = {
  skillId: true,
  kind: true,
  skill: { select: { id: true, name: true, category: true } },
} as const;

export default async function ExplorePage() {
  const user = await requireOnboardedUser();
  const [people, ownSkills, skills, communities, opportunities] =
    await Promise.all([
      db.user.findMany({
        where: { id: { not: user.id } },
        select: {
          id: true,
          profile: { select: publicProfileSelect },
          skills: { select: publicSkillSelect },
          followers: {
            where: { followerId: user.id },
            select: { followerId: true },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      db.userSkill.findMany({
        where: { userId: user.id },
        include: { skill: true },
      }),
      db.skill.findMany({
        include: {
          userSkills: { select: { kind: true } },
          followedBy: { where: { userId: user.id }, select: { userId: true } },
        },
        orderBy: { name: "asc" },
      }),
      db.community.findMany({
        include: { members: { select: { userId: true } } },
        orderBy: { createdAt: "desc" },
      }),
      db.post.findMany({
        where: {
          type: { in: ["EXCHANGE_REQUEST", "SKILL_OFFER", "QUESTION"] },
        },
        select: {
          id: true,
          content: true,
          author: {
            select: {
              id: true,
              profile: { select: publicProfileSelect },
              skills: { select: publicSkillSelect },
            },
          },
          skill: { select: { name: true, category: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return (
    <div className="page-shell py-8 sm:py-10">
      <div className="max-w-2xl">
        <p className="text-sm font-extrabold text-brand">Explore</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
          Find your next learning partner.
        </h1>
        <p className="mt-3 leading-7 text-muted">
          Search for a skill, then choose the person or opportunity that feels
          right.
        </p>
      </div>
      <div className="mt-8">
        <ExploreBrowser
          currentUserId={user.id}
          people={people}
          ownSkills={ownSkills}
          skills={skills}
          communities={communities}
          opportunities={opportunities}
        />
      </div>
    </div>
  );
}
