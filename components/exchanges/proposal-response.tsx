"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProposalResponse({ exchangeId }: { exchangeId: string }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState<"ACCEPT" | "DECLINE" | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  async function respond(action: "ACCEPT" | "DECLINE") {
    setPending(action);
    setError("");
    try {
      const response = await fetch(`/api/exchanges/${exchangeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to update this exchange.");
      dialogRef.current?.close();
      if (data.redirectTo) router.push(data.redirectTo);
      router.refresh();
    } catch (reasonValue) {
      setError(
        reasonValue instanceof Error
          ? reasonValue.message
          : "Unable to update this exchange.",
      );
      setPending(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => respond("ACCEPT")} disabled={Boolean(pending)}>
          {pending === "ACCEPT" ? "Accepting..." : "Accept exchange"}
        </Button>
        <Button
          variant="tertiary"
          onClick={() => dialogRef.current?.showModal()}
          disabled={Boolean(pending)}
        >
          Decline
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      )}
      <dialog
        ref={dialogRef}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-0 text-ink shadow-lift backdrop:bg-[#11251D]/45"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Decline this request?
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                No reason is required. Saying no to an exchange is completely
                okay.
              </p>
            </div>
            <button
              onClick={() => dialogRef.current?.close()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-black/[0.04]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <label className="mt-5 block">
            <span className="field-label">
              What did not work?{" "}
              <span className="font-medium text-muted">
                optional and private
              </span>
            </span>
            <select
              className="field"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            >
              <option value="">Prefer not to say</option>
              <option>Timing</option>
              <option>Skill mismatch</option>
              <option>Level mismatch</option>
              <option>Not interested</option>
              <option>Communication</option>
              <option>Other</option>
            </select>
          </label>
          {error && (
            <p className="mt-4 text-sm font-semibold text-red-700" role="alert">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="tertiary"
              onClick={() => dialogRef.current?.close()}
              disabled={Boolean(pending)}
            >
              Keep request
            </Button>
            <Button
              variant="danger"
              onClick={() => respond("DECLINE")}
              disabled={Boolean(pending)}
            >
              {pending === "DECLINE" ? "Declining..." : "Decline request"}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
