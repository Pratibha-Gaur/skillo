"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

type Skill = { id: string; name: string; category: string };

export function OnboardingForm({
  skills,
  name,
}: {
  skills: Skill[];
  name: string;
}) {
  const router = useRouter();
  const [teachSkillId, setTeachSkillId] = useState("");
  const [learnSkillId, setLearnSkillId] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!teachSkillId || !learnSkillId || teachSkillId === learnSkillId) {
      setError("Choose two different skills to continue.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teachSkillId, learnSkillId }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to save your skills.");
      router.push(data.redirectTo);
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to save your skills.",
      );
      setPending(false);
    }
  }

  return (
    <form className="w-full" onSubmit={submit}>
      <p className="text-sm font-extrabold text-brand">
        Hello, {name.split(" ")[0]}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
        Your Skill Wallet starts here.
      </h1>
      <p className="mt-3 max-w-lg leading-7 text-muted">
        You do not need to be an expert. Pick something you could patiently help
        a beginner understand.
      </p>

      <div className="mt-9 space-y-5">
        <label className="block rounded-2xl border border-line bg-surface p-5 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
          <span className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Lightbulb className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block font-extrabold text-ink">
                What can you teach?
              </span>
              <span className="mt-1 block text-sm leading-6 text-muted">
                Something you can explain, demonstrate, or practice with another
                person.
              </span>
              <select
                value={teachSkillId}
                onChange={(event) => setTeachSkillId(event.target.value)}
                className="field mt-4"
                required
              >
                <option value="">Choose a skill</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name} · {skill.category}
                  </option>
                ))}
              </select>
            </span>
          </span>
        </label>

        <label className="block rounded-2xl border border-line bg-surface p-5 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
          <span className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FCEBE5] text-[#A64B37]">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block font-extrabold text-ink">
                What do you want to learn?
              </span>
              <span className="mt-1 block text-sm leading-6 text-muted">
                Choose the skill you would be happiest to begin with.
              </span>
              <select
                value={learnSkillId}
                onChange={(event) => setLearnSkillId(event.target.value)}
                className="field mt-4"
                required
              >
                <option value="">Choose a skill</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name} · {skill.category}
                  </option>
                ))}
              </select>
            </span>
          </span>
        </label>
      </div>

      {error && (
        <p
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
      <Button
        type="submit"
        className="mt-6 min-h-12 w-full text-base sm:w-auto sm:px-6"
        disabled={pending}
      >
        {pending ? "Saving your skills..." : "Enter Skillo"}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
      <p className="mt-4 text-xs leading-5 text-muted">
        You can add more skills and adjust your confidence level later.
      </p>
    </form>
  );
}
