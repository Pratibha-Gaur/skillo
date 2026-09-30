"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Search, UsersRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { SkillTag } from "@/components/ui/skill-tag";
import { ToggleAction } from "@/components/ui/toggle-action";
import { ProposalModal } from "@/components/exchanges/proposal-modal";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type UserSkill = {
  skillId: string;
  kind: string;
  skill: { id: string; name: string; category: string };
};
type Person = {
  id: string;
  profile: {
    name: string;
    username: string;
    avatarColor: string;
    bio: string;
  } | null;
  skills: UserSkill[];
  followers: Array<{ followerId: string }>;
};
type Skill = {
  id: string;
  name: string;
  category: string;
  description: string;
  userSkills: Array<{ kind: string }>;
  followedBy: Array<{ userId: string }>;
};
type Community = {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  members: Array<{ userId: string }>;
};
type Opportunity = {
  id: string;
  content: string;
  author: { id: string; profile: Person["profile"]; skills: UserSkill[] };
  skill: { name: string; category: string } | null;
};

type Props = {
  currentUserId: string;
  people: Person[];
  ownSkills: UserSkill[];
  skills: Skill[];
  communities: Community[];
  opportunities: Opportunity[];
};

const tabs = ["People", "Skills", "Exchanges", "Communities"] as const;
type Tab = (typeof tabs)[number];

export function ExploreBrowser({
  currentUserId,
  people,
  ownSkills,
  skills,
  communities,
  opportunities,
}: Props) {
  const [tab, setTab] = useState<Tab>("People");
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const filteredPeople = useMemo(
    () =>
      people.filter((person) => {
        const haystack =
          `${person.profile?.name ?? ""} ${person.profile?.bio ?? ""} ${person.skills.map((item) => item.skill.name).join(" ")}`.toLowerCase();
        return !normalized || haystack.includes(normalized);
      }),
    [people, normalized],
  );
  const filteredSkills = skills.filter(
    (skill) =>
      !normalized ||
      `${skill.name} ${skill.category} ${skill.description}`
        .toLowerCase()
        .includes(normalized),
  );
  const filteredCommunities = communities.filter(
    (community) =>
      !normalized ||
      `${community.name} ${community.description}`
        .toLowerCase()
        .includes(normalized),
  );
  const filteredOpportunities = opportunities.filter(
    (post) =>
      !normalized ||
      `${post.content} ${post.skill?.name ?? ""} ${post.author.profile?.name ?? ""}`
        .toLowerCase()
        .includes(normalized),
  );

  return (
    <div>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="field min-h-14 pl-12 pr-4 text-base"
          type="search"
          placeholder="What do you want to learn?"
          aria-label="Search people, skills, exchanges, and communities"
        />
      </div>
      <div
        className="mt-5 flex gap-1 overflow-x-auto border-b border-line"
        role="tablist"
        aria-label="Explore categories"
      >
        {tabs.map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={cn(
              "relative min-h-11 shrink-0 px-4 text-sm font-extrabold outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand",
              tab === item
                ? "text-brand after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-brand"
                : "text-muted hover:text-ink",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-7">
        {tab === "People" && (
          <div className="divide-y divide-line">
            {filteredPeople.map((person) => {
              if (!person.profile) return null;
              const teachOptions = ownSkills
                .filter(
                  (own) =>
                    own.kind === "TEACH" &&
                    person.skills.some(
                      (theirs) =>
                        theirs.kind === "LEARN" &&
                        theirs.skillId === own.skillId,
                    ),
                )
                .map((item) => item.skill);
              const learnOptions = ownSkills
                .filter(
                  (own) =>
                    own.kind === "LEARN" &&
                    person.skills.some(
                      (theirs) =>
                        theirs.kind === "TEACH" &&
                        theirs.skillId === own.skillId,
                    ),
                )
                .map((item) => item.skill);
              const direct = teachOptions.length > 0 && learnOptions.length > 0;
              const visibleTeach = person.skills.find(
                (item) => item.kind === "TEACH",
              )?.skill;
              const visibleLearn = person.skills.find(
                (item) => item.kind === "LEARN",
              )?.skill;
              return (
                <article
                  key={person.id}
                  className="grid gap-5 py-6 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="flex min-w-0 gap-4">
                    <Avatar
                      name={person.profile.name}
                      color={person.profile.avatarColor}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-extrabold tracking-tight">
                          {person.profile.name}
                        </h2>
                        {direct && (
                          <span className="rounded-md bg-brand-soft px-2 py-1 text-xs font-extrabold text-brand">
                            Direct match
                          </span>
                        )}
                      </div>
                      {visibleTeach && visibleLearn ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <SkillTag
                            name={visibleTeach.name}
                            category={visibleTeach.category}
                          />
                          <span className="font-bold text-muted">↔</span>
                          <SkillTag
                            name={visibleLearn.name}
                            category={visibleLearn.category}
                          />
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-muted">
                          Building a Skill Wallet
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Link
                      href={`/profile/${person.profile.username}`}
                      className={buttonClassName("secondary")}
                    >
                      View profile
                    </Link>
                    {direct && (
                      <ProposalModal
                        person={{ id: person.id, name: person.profile.name }}
                        teachOptions={teachOptions}
                        learnOptions={learnOptions}
                      />
                    )}
                  </div>
                </article>
              );
            })}
            {!filteredPeople.length && (
              <ResultEmpty query={query} label="people" />
            )}
          </div>
        )}

        {tab === "Skills" && (
          <div className="grid gap-x-8 md:grid-cols-2">
            {filteredSkills.map((skill) => {
              const following = skill.followedBy.some(
                (follow) => follow.userId === currentUserId,
              );
              const teachers = skill.userSkills.filter(
                (item) => item.kind === "TEACH",
              ).length;
              return (
                <article key={skill.id} className="border-b border-line py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <SkillTag name={skill.name} category={skill.category} />
                      <h2 className="mt-3 text-lg font-extrabold tracking-tight">
                        Learn {skill.name}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {skill.description}
                      </p>
                      {teachers > 0 && (
                        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-muted">
                          <UsersRound className="h-4 w-4" aria-hidden="true" />
                          {teachers}{" "}
                          {teachers === 1 ? "person can" : "people can"} help
                        </p>
                      )}
                    </div>
                    <ToggleAction
                      initial={following}
                      endpoint={`/api/skills/${skill.id}/follow`}
                      activeLabel="Following"
                      inactiveLabel="Follow"
                    />
                  </div>
                </article>
              );
            })}
            {!filteredSkills.length && (
              <ResultEmpty query={query} label="skills" />
            )}
          </div>
        )}

        {tab === "Exchanges" && (
          <div className="divide-y divide-line">
            {filteredOpportunities.map((post) => {
              const profile = post.author.profile;
              if (!profile) return null;
              return (
                <article key={post.id} className="py-6">
                  <div className="flex gap-4">
                    <Avatar
                      name={profile.name}
                      color={profile.avatarColor}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-extrabold">{profile.name}</h2>
                        {post.skill && (
                          <SkillTag
                            name={post.skill.name}
                            category={post.skill.category}
                          />
                        )}
                      </div>
                      <p className="mt-3 max-w-2xl leading-7 text-ink">
                        {post.content}
                      </p>
                      <Link
                        href={`/profile/${profile.username}`}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-extrabold text-brand hover:text-brand-dark"
                      >
                        See if you can help
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
            {!filteredOpportunities.length && (
              <ResultEmpty query={query} label="exchange opportunities" />
            )}
          </div>
        )}

        {tab === "Communities" && (
          <div className="grid gap-x-8 md:grid-cols-2">
            {filteredCommunities.map((community) => {
              const joined = community.members.some(
                (member) => member.userId === currentUserId,
              );
              return (
                <article
                  key={community.id}
                  className="border-b border-line py-6"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAEFE8] text-brand">
                      <BookOpen className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="font-extrabold tracking-tight">
                          {community.name}
                        </h2>
                        <ToggleAction
                          initial={joined}
                          endpoint={`/api/communities/${community.id}/join`}
                          activeLabel="Joined"
                          inactiveLabel="Join"
                        />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {community.description}
                      </p>
                      <p className="mt-3 text-xs font-bold text-muted">
                        Private community
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
            {!filteredCommunities.length && (
              <ResultEmpty query={query} label="communities" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultEmpty({ query, label }: { query: string; label: string }) {
  return (
    <div className="col-span-full py-14 text-center">
      <p className="font-extrabold">No {label} found</p>
      <p className="mt-2 text-sm text-muted">
        {query
          ? `Try a broader search than “${query}”.`
          : "There is nothing to show here yet."}
      </p>
    </div>
  );
}
