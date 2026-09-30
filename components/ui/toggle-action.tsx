"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type ToggleActionProps = {
  initial: boolean;
  activeLabel: string;
  inactiveLabel: string;
  endpoint: string;
};

export function ToggleAction({
  initial,
  activeLabel,
  inactiveLabel,
  endpoint,
}: ToggleActionProps) {
  const [active, setActive] = useState(initial);
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    try {
      const response = await fetch(endpoint, {
        method: active ? "DELETE" : "POST",
      });
      if (response.ok) setActive((value) => !value);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant={active ? "tertiary" : "secondary"}
      onClick={toggle}
      disabled={pending}
      className="min-h-9 px-3 py-1.5"
    >
      {active ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Plus className="h-4 w-4" aria-hidden="true" />
      )}
      {active ? activeLabel : inactiveLabel}
    </Button>
  );
}
