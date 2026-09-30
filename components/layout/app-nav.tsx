"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Compass,
  Home,
  MessageCircle,
  Repeat2,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/cn";

const primaryItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/exchanges", label: "Exchanges", icon: Repeat2 },
  { href: "/messages", label: "Messages", icon: MessageCircle },
];

function activeFor(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary navigation"
      className="hidden items-center gap-1 lg:flex"
    >
      {primaryItems.map(({ href, label, icon: Icon }) => {
        const active = activeFor(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand",
              active
                ? "bg-brand-soft text-brand"
                : "text-muted hover:bg-black/[0.035] hover:text-ink",
            )}
          >
            <Icon
              className="h-[18px] w-[18px]"
              strokeWidth={active ? 2.4 : 2}
              aria-hidden="true"
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileBottomNav({ username }: { username: string }) {
  const pathname = usePathname();
  const items = [
    primaryItems[0],
    primaryItems[1],
    primaryItems[2],
    primaryItems[3],
    { href: `/profile/${username}`, label: "Profile", icon: UserRound },
  ];
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto grid h-[64px] max-w-lg grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            activeFor(pathname, href) ||
            (label === "Profile" && pathname.startsWith("/profile"));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[0.68rem] font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand",
                active ? "text-brand" : "text-muted",
              )}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={active ? 2.5 : 2}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function NotificationLink({ unread }: { unread: number }) {
  const pathname = usePathname();
  const active = activeFor(pathname, "/notifications");
  return (
    <Link
      href="/notifications"
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand",
        active
          ? "bg-brand-soft text-brand"
          : "text-muted hover:bg-black/[0.04] hover:text-ink",
      )}
      aria-label={unread ? `${unread} unread notifications` : "Notifications"}
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {unread > 0 && (
        <span
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-coral ring-2 ring-surface"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}
