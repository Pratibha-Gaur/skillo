"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Person = {
  id: string;
  name: string;
  username: string;
  avatarColor: string;
};
type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  exchangeId: string | null;
  content: string;
  createdAt: Date;
  readAt: Date | null;
};
type Conversation = { person: Person; messages: Message[] };

export function MessagesClient({
  currentUserId,
  initialConversations,
}: {
  currentUserId: string;
  initialConversations: Conversation[];
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(
    initialConversations[0]?.person.id ?? "",
  );
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const selected = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.person.id === selectedId,
      ),
    [conversations, selectedId],
  );

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || !message.trim()) return;
    setPending(true);
    setError("");
    try {
      const latestExchange =
        [...selected.messages].reverse().find((item) => item.exchangeId)
          ?.exchangeId ?? null;
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selected.person.id,
          exchangeId: latestExchange,
          content: message,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to send this message.");
      setConversations((current) =>
        current.map((conversation) =>
          conversation.person.id === selected.person.id
            ? {
                ...conversation,
                messages: [
                  ...conversation.messages,
                  {
                    ...data.message,
                    createdAt: new Date(data.message.createdAt),
                  },
                ],
              }
            : conversation,
        ),
      );
      setMessage("");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to send this message.",
      );
    } finally {
      setPending(false);
    }
  }

  if (!conversations.length)
    return (
      <div className="border-y border-line py-16 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <MessageCircle className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-lg font-extrabold">No conversations yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
          Messages begin when you contact someone or start discussing an
          exchange.
        </p>
      </div>
    );

  return (
    <div className="min-h-[620px] overflow-hidden rounded-2xl border border-line bg-surface md:grid md:grid-cols-[300px_1fr]">
      <aside
        className={cn("border-r border-line", selectedId && "hidden md:block")}
      >
        <div className="border-b border-line px-4 py-4">
          <h2 className="font-extrabold tracking-tight">Conversations</h2>
        </div>
        <div>
          {conversations.map((conversation) => {
            const latest = conversation.messages.at(-1);
            const active = conversation.person.id === selectedId;
            return (
              <button
                key={conversation.person.id}
                onClick={() => setSelectedId(conversation.person.id)}
                className={cn(
                  "flex w-full gap-3 border-b border-line px-4 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand",
                  active ? "bg-brand-soft/70" : "hover:bg-black/[0.025]",
                )}
              >
                <Avatar
                  name={conversation.person.name}
                  color={conversation.person.avatarColor}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-extrabold">
                      {conversation.person.name}
                    </span>
                    {latest && (
                      <time className="shrink-0 text-[0.68rem] text-muted">
                        {new Intl.DateTimeFormat("en", {
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date(latest.createdAt))}
                      </time>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs leading-5 text-muted">
                    {latest?.content}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>
      {selected && (
        <section
          className={cn(
            "flex min-h-[620px] flex-col",
            !selectedId && "hidden md:flex",
          )}
        >
          <header className="flex items-center gap-3 border-b border-line px-4 py-3.5">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted md:hidden"
              onClick={() => setSelectedId("")}
              aria-label="Back to conversations"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Avatar
              name={selected.person.name}
              color={selected.person.avatarColor}
            />
            <div>
              <h2 className="text-sm font-extrabold">{selected.person.name}</h2>
              <p className="text-xs text-muted">@{selected.person.username}</p>
            </div>
          </header>
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {selected.messages.map((item) => {
              const own = item.senderId === currentUserId;
              return (
                <div
                  key={item.id}
                  className={cn("flex", own ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6",
                      own
                        ? "rounded-br-md bg-brand text-white"
                        : "rounded-bl-md bg-[#F0F2ED] text-ink",
                    )}
                  >
                    <p>{item.content}</p>
                    <time
                      className={cn(
                        "mt-1 block text-[0.68rem]",
                        own ? "text-white/70" : "text-muted",
                      )}
                    >
                      {new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(item.createdAt))}
                    </time>
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={send} className="border-t border-line p-4">
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="direct-message">
                Message {selected.person.name}
              </label>
              <input
                id="direct-message"
                className="field"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={1000}
                placeholder={`Message ${selected.person.name.split(" ")[0]}...`}
              />
              <Button
                type="submit"
                className="px-3"
                disabled={pending || !message.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {error && (
              <p
                className="mt-2 text-sm font-semibold text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}
            <p className="mt-2 text-xs text-muted">
              Text only. Keep exchange plans and tasks in the shared workspace.
            </p>
          </form>
        </section>
      )}
    </div>
  );
}
