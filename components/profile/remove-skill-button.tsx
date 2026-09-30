"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export function RemoveSkillButton({
  userId,
  skillId,
  kind,
  name,
}: {
  userId: string;
  skillId: string;
  kind: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function remove() {
    setPending(true);
    const response = await fetch(
      `/api/users/${userId}/skills/${skillId}?kind=${kind}`,
      { method: "DELETE" },
    );
    if (response.ok) router.refresh();
    else setPending(false);
  }
  return (
    <button
      onClick={remove}
      disabled={pending}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-black/[0.05] hover:text-ink disabled:opacity-50"
      aria-label={`Remove ${name} from this section`}
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );
}
