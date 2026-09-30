"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AddSkillModal({
  userId,
  skills,
}: {
  userId: string;
  skills: Array<{ id: string; name: string; category: string }>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [skillId, setSkillId] = useState("");
  const [customName, setCustomName] = useState("");
  const [kind, setKind] = useState("TEACH");
  const [level, setLevel] = useState("BASICS");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/users/${userId}/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId: skillId || undefined,
          customName: skillId ? undefined : customName,
          kind,
          level,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to add this skill.");
      dialogRef.current?.close();
      setSkillId("");
      setCustomName("");
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to add this skill.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => dialogRef.current?.showModal()}
      >
        <Plus className="h-4 w-4" />
        Add skill
      </Button>
      <dialog
        ref={dialogRef}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-line bg-surface p-0 text-ink shadow-lift backdrop:bg-[#11251D]/45"
      >
        <form onSubmit={submit}>
          <header className="flex items-start justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Add to your Skill Wallet
              </h2>
              <p className="mt-1 text-sm text-muted">
                Skills can move between sections as you grow.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-black/[0.04]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </header>
          <div className="space-y-5 p-5">
            <label className="block">
              <span className="field-label">Wallet section</span>
              <select
                className="field"
                value={kind}
                onChange={(event) => setKind(event.target.value)}
              >
                <option value="TEACH">Can teach</option>
                <option value="LEARN">Want to learn</option>
                <option value="CURRENT">Currently learning</option>
              </select>
            </label>
            <label className="block">
              <span className="field-label">Choose a skill</span>
              <select
                className="field"
                value={skillId}
                onChange={(event) => setSkillId(event.target.value)}
              >
                <option value="">Add a different skill</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name} · {skill.category}
                  </option>
                ))}
              </select>
            </label>
            {!skillId && (
              <label className="block">
                <span className="field-label">Skill name</span>
                <input
                  className="field"
                  value={customName}
                  onChange={(event) => setCustomName(event.target.value)}
                  maxLength={60}
                  placeholder="For example, bread making"
                />
              </label>
            )}
            <label className="block">
              <span className="field-label">Your confidence</span>
              <select
                className="field"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
              >
                <option value="BASICS">Can help with the basics</option>
                <option value="COMFORTABLE">Comfortable</option>
                <option value="VERY_STRONG">Very strong</option>
              </select>
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
          <footer className="flex justify-end gap-2 border-t border-line px-5 py-4">
            <Button
              variant="tertiary"
              type="button"
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending || (!skillId && customName.trim().length < 2)}
            >
              {pending ? "Adding..." : "Add skill"}
            </Button>
          </footer>
        </form>
      </dialog>
    </>
  );
}
