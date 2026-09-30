"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const dimensions = [
  ["teaching", "Teaching quality"],
  ["reliability", "Reliability"],
  ["communication", "Communication"],
  ["helpfulness", "Helpfulness"],
  ["respect", "Respectful behavior"],
  ["overall", "Overall experience"],
] as const;

type ScoreKey = (typeof dimensions)[number][0];

export function RatingForm({
  exchangeId,
  partnerName,
}: {
  exchangeId: string;
  partnerName: string;
}) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<ScoreKey, number>>({
    teaching: 5,
    reliability: 5,
    communication: 5,
    helpfulness: 5,
    respect: 5,
    overall: 5,
  });
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/exchanges/${exchangeId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...scores, note }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to save your feedback.");
      setSubmitted(true);
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to save your feedback.",
      );
    } finally {
      setPending(false);
    }
  }

  if (submitted)
    return (
      <div className="rounded-2xl border border-[#C9DCD1] bg-brand-soft p-5 text-center">
        <CheckCircle2 className="mx-auto h-6 w-6 text-brand" />
        <p className="mt-3 font-extrabold">Feedback saved</p>
        <p className="mt-1 text-sm text-muted">
          Thank you for helping Skillo keep exchanges thoughtful.
        </p>
      </div>
    );

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
    >
      <h2 className="text-xl font-extrabold tracking-tight">
        How was learning with {partnerName}?
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Your feedback becomes part of a balanced reputation over multiple
        exchanges.
      </p>
      <div className="mt-6 space-y-4">
        {dimensions.map(([key, label]) => (
          <fieldset
            key={key}
            className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"
          >
            <legend className="text-sm font-bold text-ink">{label}</legend>
            <div className="flex gap-1" aria-label={`${label} rating`}>
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  type="button"
                  key={score}
                  onClick={() => setScores({ ...scores, [key]: score })}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-extrabold outline-none focus-visible:ring-2 focus-visible:ring-brand ${scores[key] === score ? "border-brand bg-brand text-white" : "border-line bg-white text-muted hover:border-brand/50"}`}
                  aria-pressed={scores[key] === score}
                >
                  {score}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <label className="mt-6 block">
        <span className="field-label">
          Private note for context{" "}
          <span className="font-medium text-muted">optional</span>
        </span>
        <textarea
          className="field min-h-24 resize-none py-3 leading-6"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={300}
          placeholder="What worked well?"
        />
      </label>
      {error && (
        <p className="mt-4 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      )}
      <Button className="mt-5 w-full" type="submit" disabled={pending}>
        {pending ? "Saving feedback..." : "Submit feedback"}
      </Button>
    </form>
  );
}
