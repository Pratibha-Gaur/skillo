"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageOff, Plus, Send, X } from "lucide-react";
import { POST_TYPES } from "@/lib/constants";
import { Button, buttonClassName } from "@/components/ui/button";

type Skill = { id: string; name: string };

export function CreatePostModal({
  skills,
  compact = false,
}: {
  skills: Skill[];
  compact?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [type, setType] = useState("UPDATE");
  const [skillId, setSkillId] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function open() {
    setError("");
    dialogRef.current?.showModal();
  }

  function close() {
    if (!pending) dialogRef.current?.close();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, skillId: skillId || null, content }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to publish this post.");
      setContent("");
      setSkillId("");
      setType("UPDATE");
      dialogRef.current?.close();
      router.push("/home");
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to publish this post.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        onClick={open}
        className={buttonClassName(
          "primary",
          compact ? "h-10 w-10 px-0" : "px-3 sm:px-3.5",
        )}
        aria-label="Create a post"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {!compact && <span className="hidden sm:inline">Create</span>}
      </button>
      <dialog
        ref={dialogRef}
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-2xl border border-line bg-surface p-0 text-ink shadow-lift backdrop:bg-[#11251D]/45 open:animate-fade-up"
      >
        <form onSubmit={submit}>
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Share something useful
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                Keep it connected to learning, teaching, or making.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted outline-none hover:bg-black/[0.04] hover:text-ink focus-visible:ring-2 focus-visible:ring-brand"
              aria-label="Close create post dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </header>
          <div className="space-y-5 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="post-type">
                  Post type
                </label>
                <select
                  id="post-type"
                  className="field"
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                >
                  {POST_TYPES.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="post-skill">
                  Skill context{" "}
                  <span className="font-medium text-muted">optional</span>
                </label>
                <select
                  id="post-skill"
                  className="field"
                  value={skillId}
                  onChange={(event) => setSkillId(event.target.value)}
                >
                  <option value="">No specific skill</option>
                  {skills.map((skill) => (
                    <option value={skill.id} key={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="post-content">
                What would you like to share?
              </label>
              <textarea
                id="post-content"
                className="field min-h-36 resize-none py-3 leading-6"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                minLength={3}
                maxLength={800}
                required
                placeholder="A question, a useful lesson, something you made, or a skill you can offer..."
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <ImageOff className="h-3.5 w-3.5" aria-hidden="true" />
                  Text only for now
                </span>
                <span>{content.length}/800</span>
              </div>
            </div>
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
              onClick={close}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending || content.trim().length < 3}
            >
              {pending ? "Publishing..." : "Publish"}
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </footer>
        </form>
      </dialog>
    </>
  );
}
