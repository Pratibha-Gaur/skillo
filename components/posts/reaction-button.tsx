"use client";

import { useState } from "react";
import { Heart, HandHeart } from "lucide-react";
import { cn } from "@/lib/cn";

const labels: Record<string, string> = {
  HELPFUL: "Helpful",
  INSPIRING: "Inspiring",
  NICE_PROGRESS: "Nice progress",
  CAN_HELP: "I can help",
  WANT_TO_LEARN: "Want to learn",
};

export function ReactionButton({
  postId,
  initialType,
  initialCount,
  emphasis = "HELPFUL",
}: {
  postId: string;
  initialType?: string;
  initialCount: number;
  emphasis?: "HELPFUL" | "CAN_HELP";
}) {
  const [activeType, setActiveType] = useState(initialType);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  const type = activeType ?? emphasis;
  const Icon = emphasis === "CAN_HELP" ? HandHeart : Heart;

  async function toggle() {
    if (pending) return;
    setPending(true);
    try {
      const response = await fetch(`/api/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: emphasis }),
      });
      const data = await response.json();
      if (!response.ok) return;
      if (data.active) {
        setCount((value) => value + (activeType ? 0 : 1));
        setActiveType(data.type);
      } else {
        setCount((value) => Math.max(0, value - 1));
        setActiveType(undefined);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-pressed={activeType === emphasis}
      className={cn(
        "inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-60",
        activeType === emphasis
          ? "bg-[#FCEAE5] text-[#A64B37]"
          : "text-muted hover:bg-black/[0.035] hover:text-ink",
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px]",
          activeType === emphasis && emphasis === "HELPFUL" && "fill-current",
        )}
        aria-hidden="true"
      />
      <span>{activeType ? labels[type] : labels[emphasis]}</span>
      {count > 0 && (
        <span
          className="font-semibold tabular-nums"
          aria-label={`${count} reactions`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
