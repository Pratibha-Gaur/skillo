"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { Button, buttonClassName } from "@/components/ui/button";

type Skill = { id: string; name: string };

type ProposalModalProps = {
  person: { id: string; name: string };
  teachOptions: Skill[];
  learnOptions: Skill[];
  label?: string;
};

export function ProposalModal({
  person,
  teachOptions,
  learnOptions,
  label = "Propose exchange",
}: ProposalModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [teachSkillId, setTeachSkillId] = useState(teachOptions[0]?.id ?? "");
  const [learnSkillId, setLearnSkillId] = useState(learnOptions[0]?.id ?? "");
  const [sessionCount, setSessionCount] = useState(4);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [availability, setAvailability] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const teachSkill = useMemo(
    () => teachOptions.find((skill) => skill.id === teachSkillId),
    [teachOptions, teachSkillId],
  );
  const learnSkill = useMemo(
    () => learnOptions.find((skill) => skill.id === learnSkillId),
    [learnOptions, learnSkillId],
  );
  const suggestedNote = `Alternate practical ${teachSkill?.name ?? "teaching"} and ${learnSkill?.name ?? "learning"} sessions. End each one with a small activity to try before the next meeting.`;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/exchanges/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: person.id,
          teachSkillId,
          learnSkillId,
          sessionCount,
          durationMinutes,
          availability,
          note: note || suggestedNote,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to send this proposal.");
      dialogRef.current?.close();
      router.push(data.redirectTo);
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to send this proposal.",
      );
      setPending(false);
    }
  }

  if (!teachOptions.length || !learnOptions.length) return null;

  return (
    <>
      <button
        className={buttonClassName("primary")}
        onClick={() => dialogRef.current?.showModal()}
      >
        {label}
      </button>
      <dialog
        ref={dialogRef}
        className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-line bg-surface p-0 text-ink shadow-lift backdrop:bg-[#11251D]/45 open:animate-fade-up"
      >
        <form onSubmit={submit}>
          <header className="flex items-start justify-between border-b border-line px-5 py-4 sm:px-6">
            <div>
              <p className="text-sm font-extrabold text-brand">
                Suggested skill exchange
              </p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight">
                Make a plan with {person.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-black/[0.04] hover:text-ink"
              aria-label="Close proposal"
            >
              <X className="h-5 w-5" />
            </button>
          </header>
          <div className="space-y-6 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
              <label>
                <span className="field-label">You can teach</span>
                <select
                  className="field"
                  value={teachSkillId}
                  onChange={(event) => setTeachSkillId(event.target.value)}
                >
                  {teachOptions.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </label>
              <ArrowRight
                className="mx-auto mb-3 hidden h-5 w-5 text-brand sm:block"
                aria-hidden="true"
              />
              <label>
                <span className="field-label">You can learn</span>
                <select
                  className="field"
                  value={learnSkillId}
                  onChange={(event) => setLearnSkillId(event.target.value)}
                >
                  {learnOptions.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="rounded-xl border border-[#E9DDBD] bg-[#FCF7E8] p-4">
              <div className="flex gap-3">
                <Sparkles
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#86651A]"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-extrabold">
                    A starting point, not a decision
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Skillo has suggested the structure below. You can change
                    everything before sending it.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="field-label">Number of sessions</span>
                <select
                  className="field"
                  value={sessionCount}
                  onChange={(event) =>
                    setSessionCount(Number(event.target.value))
                  }
                >
                  {[2, 3, 4, 5, 6].map((count) => (
                    <option value={count} key={count}>
                      {count} sessions
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-label">Time per session</span>
                <select
                  className="field"
                  value={durationMinutes}
                  onChange={(event) =>
                    setDurationMinutes(Number(event.target.value))
                  }
                >
                  {[35, 45, 60, 75].map((duration) => (
                    <option value={duration} key={duration}>
                      {duration} minutes
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="field-label">
                When usually works?{" "}
                <span className="font-medium text-muted">optional</span>
              </span>
              <input
                className="field"
                value={availability}
                onChange={(event) => setAvailability(event.target.value)}
                maxLength={120}
                placeholder="For example, Saturday mornings"
              />
            </label>
            <label className="block">
              <span className="field-label">
                Note to {person.name.split(" ")[0]}
              </span>
              <textarea
                className="field min-h-28 resize-none py-3 leading-6"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
                placeholder={suggestedNote}
              />
            </label>
            {error && (
              <p
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
          <footer className="flex justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">
            <Button
              variant="tertiary"
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Sending..." : "Send proposal"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </footer>
        </form>
      </dialog>
    </>
  );
}
