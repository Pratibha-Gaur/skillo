import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { SkillTag } from "@/components/ui/skill-tag";
import { ReactionButton } from "@/components/posts/reaction-button";
import { relativeTime, titleCase } from "@/lib/format";

type PostCardProps = {
  post: {
    id: string;
    type: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      profile: { name: string; username: string; avatarColor: string } | null;
    };
    skill: { name: string; category: string } | null;
    reactions: Array<{ userId: string; type: string }>;
  };
  currentUserId: string;
};

export function PostCard({ post, currentUserId }: PostCardProps) {
  if (!post.author.profile) return null;
  const profile = post.author.profile;
  const currentReaction = post.reactions.find(
    (reaction) => reaction.userId === currentUserId,
  )?.type;
  const helpPost = post.type === "QUESTION" || post.type === "EXCHANGE_REQUEST";

  return (
    <article className="border-b border-line px-1 py-6 first:pt-1 sm:px-0">
      <div className="flex gap-3.5">
        <Link
          href={`/profile/${profile.username}`}
          className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <Avatar name={profile.name} color={profile.avatarColor} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <Link
              href={`/profile/${profile.username}`}
              className="font-extrabold tracking-tight text-ink hover:underline"
            >
              {profile.name}
            </Link>
            <span className="text-sm text-muted">@{profile.username}</span>
            <span className="text-sm text-muted" aria-hidden="true">
              ·
            </span>
            <time
              className="text-sm text-muted"
              dateTime={post.createdAt.toISOString()}
            >
              {relativeTime(post.createdAt)}
            </time>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-brand">
              {titleCase(post.type)}
            </span>
            {post.skill && (
              <SkillTag name={post.skill.name} category={post.skill.category} />
            )}
          </div>
          <p className="mt-3 whitespace-pre-wrap text-[0.98rem] leading-7 text-ink">
            {post.content}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-1">
            <ReactionButton
              postId={post.id}
              initialType={currentReaction}
              initialCount={post.reactions.length}
              emphasis={helpPost ? "CAN_HELP" : "HELPFUL"}
            />
            {helpPost && (
              <Link
                href={`/profile/${profile.username}`}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-bold text-muted outline-none transition hover:bg-black/[0.035] hover:text-ink focus-visible:ring-2 focus-visible:ring-brand"
              >
                <MessageCircle
                  className="h-[18px] w-[18px]"
                  aria-hidden="true"
                />
                View person
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
