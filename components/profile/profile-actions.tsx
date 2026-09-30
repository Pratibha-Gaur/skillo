"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleAction } from "@/components/ui/toggle-action";

export function OwnProfileActions({
  userId,
  initial,
}: {
  userId: string;
  initial: { name: string; bio: string; location: string };
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to save your profile.");
      dialogRef.current?.close();
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to save your profile.",
      );
    } finally {
      setPending(false);
    }
  }
  async function logout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        onClick={() => dialogRef.current?.showModal()}
      >
        <Edit3 className="h-4 w-4" />
        Edit profile
      </Button>
      <Button variant="tertiary" onClick={logout} disabled={pending}>
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
      <dialog
        ref={dialogRef}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-line bg-surface p-0 text-ink shadow-lift backdrop:bg-[#11251D]/45"
      >
        <form onSubmit={save}>
          <header className="flex items-start justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Edit your profile
              </h2>
              <p className="mt-1 text-sm text-muted">
                Keep it focused on what you enjoy learning and sharing.
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
              <span className="field-label">Name</span>
              <input
                className="field"
                value={values.name}
                onChange={(event) =>
                  setValues({ ...values, name: event.target.value })
                }
                maxLength={60}
                required
              />
            </label>
            <label className="block">
              <span className="field-label">Skill-focused bio</span>
              <textarea
                className="field min-h-28 resize-none py-3 leading-6"
                value={values.bio}
                onChange={(event) =>
                  setValues({ ...values, bio: event.target.value })
                }
                maxLength={240}
                placeholder="What do you enjoy teaching and learning?"
              />
            </label>
            <label className="block">
              <span className="field-label">
                Location{" "}
                <span className="font-medium text-muted">optional</span>
              </span>
              <input
                className="field"
                value={values.location}
                onChange={(event) =>
                  setValues({ ...values, location: event.target.value })
                }
                maxLength={60}
              />
            </label>
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">
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
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save profile"}
            </Button>
          </footer>
        </form>
      </dialog>
    </div>
  );
}

export function OtherProfileActions({
  userId,
  following,
}: {
  userId: string;
  following: boolean;
}) {
  return (
    <ToggleAction
      initial={following}
      endpoint={`/api/users/${userId}/follow`}
      activeLabel="Following"
      inactiveLabel="Follow"
    />
  );
}
