"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, Circle, Send, Sparkles, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";

type PlanItem = {
  id: string;
  week: number;
  title: string;
  description: string;
  status: string;
};
type Task = { id: string; title: string; status: string };
type Session = {
  id: string;
  teacherId: string;
  learnerId: string;
  title: string;
  durationMinutes: number;
  scheduledFor: Date | null;
  teacherCompletedAt: Date | null;
  learnerConfirmedAt: Date | null;
  tasks: Task[];
};
type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
};

type Props = {
  exchangeId: string;
  currentUserId: string;
  partner: { id: string; name: string; avatarColor: string };
  planItems: PlanItem[];
  sessions: Session[];
  messages: Message[];
  progress: number;
};

type Tab = "Sessions" | "Plan" | "Conversation";

export function ExchangeWorkspace({
  exchangeId,
  currentUserId,
  partner,
  planItems,
  sessions: initialSessions,
  messages: initialMessages,
  progress,
}: Props) {
  const router = useRouter();
  const hasConfirmation = initialSessions.some(
    (session) =>
      session.learnerId === currentUserId &&
      session.teacherCompletedAt &&
      !session.learnerConfirmedAt,
  );
  const [tab, setTab] = useState<Tab>(hasConfirmation ? "Sessions" : "Plan");
  const [sessions, setSessions] = useState(initialSessions);
  const [items, setItems] = useState(planItems);
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [celebration, setCelebration] = useState<{
    teacherName: string;
  } | null>(null);

  const completedPlanItems = useMemo(
    () => items.filter((item) => item.status === "COMPLETED").length,
    [items],
  );
  const allSessionsComplete =
    sessions.length > 0 &&
    sessions.every((session) => Boolean(session.learnerConfirmedAt));

  async function sessionAction(
    sessionId: string,
    action: "MARK_COMPLETE" | "CONFIRM",
  ) {
    setPending(`${sessionId}:${action}`);
    setError("");
    try {
      const response = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to update this session.");
      const now = new Date();
      setSessions((current) =>
        current.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                teacherCompletedAt:
                  action === "MARK_COMPLETE" ? now : session.teacherCompletedAt,
                learnerConfirmedAt:
                  action === "CONFIRM" ? now : session.learnerConfirmedAt,
              }
            : session,
        ),
      );
      if (action === "CONFIRM")
        setCelebration({ teacherName: data.teacherName });
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to update this session.",
      );
    } finally {
      setPending("");
    }
  }

  async function cycleTask(task: Task) {
    const next =
      task.status === "NOT_STARTED"
        ? "IN_PROGRESS"
        : task.status === "IN_PROGRESS"
          ? "COMPLETED"
          : "NOT_STARTED";
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (response.ok)
      setSessions((current) =>
        current.map((session) => ({
          ...session,
          tasks: session.tasks.map((currentTask) =>
            currentTask.id === task.id
              ? { ...currentTask, status: next }
              : currentTask,
          ),
        })),
      );
  }

  async function cyclePlanItem(item: PlanItem) {
    const next =
      item.status === "NOT_STARTED"
        ? "IN_PROGRESS"
        : item.status === "IN_PROGRESS"
          ? "COMPLETED"
          : "NOT_STARTED";
    const response = await fetch(`/api/plan-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (response.ok)
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, status: next }
            : currentItem,
        ),
      );
  }

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setPending("message");
    setError("");
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: partner.id,
          exchangeId,
          content: message,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to send this message.");
      setMessages((current) => [
        ...current,
        { ...data.message, createdAt: new Date(data.message.createdAt) },
      ]);
      setMessage("");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to send this message.",
      );
    } finally {
      setPending("");
    }
  }

  async function completeExchange() {
    setPending("complete-exchange");
    setError("");
    try {
      const response = await fetch(`/api/exchanges/${exchangeId}/complete`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to complete this exchange.");
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to complete this exchange.",
      );
      setPending("");
    }
  }

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,760px)_1fr]">
        <section>
          <div
            className="flex gap-1 overflow-x-auto border-b border-line"
            role="tablist"
          >
            {(["Sessions", "Plan", "Conversation"] as Tab[]).map((item) => (
              <button
                key={item}
                role="tab"
                aria-selected={tab === item}
                onClick={() => setTab(item)}
                className={cn(
                  "relative min-h-11 px-4 text-sm font-extrabold outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand",
                  tab === item
                    ? "text-brand after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-brand"
                    : "text-muted hover:text-ink",
                )}
              >
                {item}
              </button>
            ))}
          </div>

          {tab === "Sessions" && (
            <div className="divide-y divide-line border-b border-line">
              {sessions.map((session, index) => {
                const completed = Boolean(session.learnerConfirmedAt);
                const waiting = Boolean(
                  session.teacherCompletedAt && !session.learnerConfirmedAt,
                );
                const isTeacher = session.teacherId === currentUserId;
                const isLearner = session.learnerId === currentUserId;
                const scheduledFuture = Boolean(
                  session.scheduledFor &&
                    new Date(session.scheduledFor) > new Date(),
                );
                return (
                  <article key={session.id} className="py-6">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          completed
                            ? "bg-brand text-white"
                            : waiting
                              ? "bg-[#F8E8BC] text-[#765817]"
                              : "bg-[#ECEFEA] text-muted",
                        )}
                      >
                        {completed ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-extrabold">
                            {index + 1}
                          </span>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-extrabold tracking-tight">
                              {session.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted">
                              {isTeacher
                                ? "You are teaching"
                                : "You are learning"}{" "}
                              · {session.durationMinutes} minutes
                              {session.scheduledFor
                                ? ` · ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(session.scheduledFor))}`
                                : ""}
                            </p>
                          </div>
                          {completed ? (
                            <span className="text-sm font-bold text-brand">
                              Completed
                            </span>
                          ) : waiting && isLearner ? (
                            <Button
                              onClick={() =>
                                sessionAction(session.id, "CONFIRM")
                              }
                              disabled={Boolean(pending)}
                            >
                              {pending === `${session.id}:CONFIRM`
                                ? "Confirming..."
                                : "Confirm session"}
                            </Button>
                          ) : !session.teacherCompletedAt &&
                            isTeacher &&
                            !scheduledFuture ? (
                            <Button
                              variant="secondary"
                              onClick={() =>
                                sessionAction(session.id, "MARK_COMPLETE")
                              }
                              disabled={Boolean(pending)}
                            >
                              {pending === `${session.id}:MARK_COMPLETE`
                                ? "Saving..."
                                : "Mark complete"}
                            </Button>
                          ) : scheduledFuture ? (
                            <span className="text-sm font-bold text-muted">
                              Scheduled
                            </span>
                          ) : waiting ? (
                            <span className="text-sm font-bold text-muted">
                              Waiting for confirmation
                            </span>
                          ) : null}
                        </div>
                        {session.tasks.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {session.tasks.map((task) => (
                              <button
                                key={task.id}
                                onClick={() => cycleTask(task)}
                                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-muted hover:bg-black/[0.03] hover:text-ink"
                              >
                                {task.status === "COMPLETED" ? (
                                  <CheckCircle2 className="h-4 w-4 text-brand" />
                                ) : task.status === "IN_PROGRESS" ? (
                                  <Circle className="h-4 w-4 fill-[#E4AD42] text-[#E4AD42]" />
                                ) : (
                                  <Circle className="h-4 w-4" />
                                )}
                                <span
                                  className={
                                    task.status === "COMPLETED"
                                      ? "line-through opacity-70"
                                      : ""
                                  }
                                >
                                  {task.title}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
              {!sessions.length && (
                <p className="py-12 text-center text-sm text-muted">
                  Your first session will appear here after it is planned.
                </p>
              )}
            </div>
          )}

          {tab === "Plan" && (
            <div className="divide-y divide-line border-b border-line">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => cyclePlanItem(item)}
                  className="grid w-full gap-3 py-5 text-left sm:grid-cols-[72px_1fr_auto]"
                >
                  <span className="text-sm font-extrabold text-brand">
                    Week {item.week}
                  </span>
                  <span>
                    <span className="block font-extrabold tracking-tight">
                      {item.title}
                    </span>
                    <span className="mt-1.5 block text-sm leading-6 text-muted">
                      {item.description}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg",
                      item.status === "COMPLETED"
                        ? "bg-brand text-white"
                        : item.status === "IN_PROGRESS"
                          ? "bg-[#F8E8BC] text-[#765817]"
                          : "border border-line text-muted",
                    )}
                  >
                    {item.status === "COMPLETED" ? (
                      <Check className="h-4 w-4" />
                    ) : item.status === "IN_PROGRESS" ? (
                      <Circle className="h-3 w-3 fill-current" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}

          {tab === "Conversation" && (
            <div>
              <div className="max-h-[520px] min-h-80 space-y-4 overflow-y-auto py-6">
                {messages.map((item) => {
                  const own = item.senderId === currentUserId;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex",
                        own ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6",
                          own
                            ? "rounded-br-md bg-brand text-white"
                            : "rounded-bl-md border border-line bg-surface text-ink",
                        )}
                      >
                        <p>{item.content}</p>
                        <time
                          className={cn(
                            "mt-1 block text-[0.68rem]",
                            own ? "text-white/70" : "text-muted",
                          )}
                          dateTime={new Date(item.createdAt).toISOString()}
                        >
                          {new Intl.DateTimeFormat("en", {
                            hour: "numeric",
                            minute: "2-digit",
                          }).format(new Date(item.createdAt))}
                        </time>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form
                className="flex gap-2 border-t border-line pt-4"
                onSubmit={sendMessage}
              >
                <label className="sr-only" htmlFor="workspace-message">
                  Message {partner.name}
                </label>
                <input
                  id="workspace-message"
                  className="field"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={1000}
                  placeholder={`Message ${partner.name.split(" ")[0]}...`}
                />
                <Button
                  type="submit"
                  className="px-3"
                  disabled={pending === "message" || !message.trim()}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
          {error && (
            <p
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center gap-3">
              <Avatar name={partner.name} color={partner.avatarColor} />
              <div>
                <p className="text-sm text-muted">Learning with</p>
                <p className="font-extrabold">{partner.name}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-extrabold tracking-tight">Your progress</h2>
            <div className="mt-4">
              <ProgressBar value={progress} />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              {completedPlanItems} of {items.length} plan steps completed.
              Progress belongs to you, and you can update it as the work
              changes.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-[#FCF7E8] p-5">
            <Sparkles className="h-5 w-5 text-[#86651A]" aria-hidden="true" />
            <h2 className="mt-3 font-extrabold tracking-tight">
              A useful next step
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Finish the task already in progress before adding another practice
              activity.
            </p>
          </div>
          {allSessionsComplete && (
            <div className="rounded-2xl border border-[#C9DCD1] bg-brand-soft p-5">
              <CheckCircle2 className="h-5 w-5 text-brand" aria-hidden="true" />
              <h2 className="mt-3 font-extrabold tracking-tight">
                Ready to wrap up?
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Every planned session is confirmed. Complete the exchange to add
                it to both profiles.
              </p>
              <Button
                className="mt-4 w-full"
                onClick={completeExchange}
                disabled={Boolean(pending)}
              >
                {pending === "complete-exchange"
                  ? "Completing..."
                  : "Complete exchange"}
              </Button>
            </div>
          )}
        </aside>
      </div>

      {celebration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#11251D]/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="celebration-title"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-7 text-center shadow-lift animate-check-in">
            <button
              onClick={() => setCelebration(null)}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-black/[0.04]"
              aria-label="Close celebration"
            >
              <X className="h-5 w-5" />
            </button>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white">
              <Check className="h-7 w-7" />
            </span>
            <h2
              id="celebration-title"
              className="mt-5 text-2xl font-extrabold tracking-tight"
            >
              Session complete.
            </h2>
            <p className="mt-2 leading-7 text-muted">
              Your progress moved forward, and {celebration.teacherName} earned
              1 Skill Credit for teaching.
            </p>
            <Button className="mt-6" onClick={() => setCelebration(null)}>
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
