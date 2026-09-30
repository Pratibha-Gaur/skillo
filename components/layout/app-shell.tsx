import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { CreatePostModal } from "@/components/posts/create-post-modal";
import { Avatar } from "@/components/ui/avatar";
import {
  DesktopNav,
  MobileBottomNav,
  NotificationLink,
} from "@/components/layout/app-nav";

type ShellProps = {
  children: ReactNode;
  user: {
    profile: { name: string; username: string; avatarColor: string } | null;
  };
  skills: Array<{ id: string; name: string }>;
  unread: number;
  credits: number;
};

export function AppShell({
  children,
  user,
  skills,
  unread,
  credits,
}: ShellProps) {
  const profile = user.profile;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-canvas pb-20 lg:pb-0">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-md">
        <div className="page-shell flex h-[68px] items-center justify-between gap-4">
          <Logo href="/home" responsiveCompact />
          <DesktopNav />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className="mr-1 hidden items-center gap-1.5 border-r border-line pr-4 text-sm font-bold text-muted xl:flex"
              title="Skill Credits earned through confirmed teaching sessions"
            >
              <span className="text-sun" aria-hidden="true">
                ✦
              </span>
              {credits} <span className="font-semibold">Credits</span>
            </span>
            <CreatePostModal skills={skills} compact={false} />
            <NotificationLink unread={unread} />
            <Link
              href={`/profile/${profile.username}`}
              className="ml-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              aria-label="Open your profile"
            >
              <Avatar
                name={profile.name}
                color={profile.avatarColor}
                size="md"
              />
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <MobileBottomNav username={profile.username} />
    </div>
  );
}
