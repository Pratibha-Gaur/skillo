"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  Bell,
  Check,
  CheckCircle2,
  Heart,
  Repeat2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string;
  readAt: Date | null;
  createdAt: Date;
};

const icons = {
  EXCHANGE_REQUEST: Repeat2,
  EXCHANGE_ACTIVE: Repeat2,
  PLAN_READY: Sparkles,
  SESSION_COMPLETE: CheckCircle2,
  SKILL_CREDIT: Award,
  MILESTONE: Award,
  REACTION: Heart,
} as const;

export function NotificationList({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const [items, setItems] = useState(initialNotifications);
  const hasUnread = items.some((item) => !item.readAt);

  async function mark(id?: string) {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : { all: true }),
    });
    if (response.ok)
      setItems((current) =>
        current.map((item) =>
          !id || item.id === id ? { ...item, readAt: new Date() } : item,
        ),
      );
  }

  if (!items.length)
    return (
      <div className="border-y border-line py-14 text-center">
        <Bell className="mx-auto h-6 w-6 text-brand" />
        <h2 className="mt-4 text-lg font-extrabold">You are all caught up</h2>
        <p className="mt-2 text-sm text-muted">
          Exchange updates and meaningful activity will appear here.
        </p>
      </div>
    );

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {hasUnread && (
          <Button variant="tertiary" onClick={() => mark()}>
            <Check className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>
      <div className="divide-y divide-line border-y border-line">
        {items.map((item) => {
          const Icon = icons[item.type as keyof typeof icons] ?? Bell;
          const content = (
            <>
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  item.readAt
                    ? "bg-[#ECEFEA] text-muted"
                    : "bg-brand-soft text-brand",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-extrabold tracking-tight">
                  {item.title}
                </span>
                <span className="mt-1 block text-sm leading-6 text-muted">
                  {item.body}
                </span>
                <time
                  className="mt-2 block text-xs font-semibold text-muted"
                  dateTime={new Date(item.createdAt).toISOString()}
                >
                  {relativeTime(new Date(item.createdAt))}
                </time>
              </span>
              {!item.readAt && (
                <span
                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-coral"
                  aria-label="Unread"
                />
              )}
            </>
          );
          return item.href ? (
            <Link
              href={item.href}
              key={item.id}
              onClick={() => mark(item.id)}
              className="flex gap-4 px-1 py-5 outline-none hover:bg-black/[0.02] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
            >
              {content}
            </Link>
          ) : (
            <div key={item.id} className="flex gap-4 px-1 py-5">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
