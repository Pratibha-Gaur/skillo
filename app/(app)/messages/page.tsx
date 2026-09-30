import type { Metadata } from "next";
import { MessagesClient } from "@/components/messages/messages-client";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const user = await requireOnboardedUser();
  const messages = await db.message.findMany({
    where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { include: { profile: true } },
      receiver: { include: { profile: true } },
    },
  });
  const grouped = new Map<
    string,
    {
      person: {
        id: string;
        name: string;
        username: string;
        avatarColor: string;
      };
      messages: Array<{
        id: string;
        senderId: string;
        receiverId: string;
        exchangeId: string | null;
        content: string;
        createdAt: Date;
        readAt: Date | null;
      }>;
    }
  >();
  for (const message of messages) {
    const other =
      message.senderId === user.id ? message.receiver : message.sender;
    if (!other.profile) continue;
    if (!grouped.has(other.id))
      grouped.set(other.id, {
        person: {
          id: other.id,
          name: other.profile.name,
          username: other.profile.username,
          avatarColor: other.profile.avatarColor,
        },
        messages: [],
      });
    grouped.get(other.id)?.messages.push({
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      exchangeId: message.exchangeId,
      content: message.content,
      createdAt: message.createdAt,
      readAt: message.readAt,
    });
  }
  const conversations = [...grouped.values()].sort(
    (a, b) =>
      (b.messages.at(-1)?.createdAt.getTime() ?? 0) -
      (a.messages.at(-1)?.createdAt.getTime() ?? 0),
  );

  return (
    <div className="page-shell py-8 sm:py-10">
      <div>
        <p className="text-sm font-extrabold text-brand">Messages</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
          Keep the conversation simple.
        </h1>
        <p className="mt-3 max-w-xl leading-7 text-muted">
          Use direct messages to say hello. Use an exchange workspace for plans,
          sessions, and progress.
        </p>
      </div>
      <div className="mt-8">
        <MessagesClient
          currentUserId={user.id}
          initialConversations={conversations}
        />
      </div>
    </div>
  );
}
