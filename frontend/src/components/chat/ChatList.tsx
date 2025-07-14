"use client";

import { cn } from "@/lib/utils";
import { Chat } from "@/src/types";
import { useRouter } from "next/navigation";
import AvatarDiv from "../Avatar";

interface ChatListItemProps {
  chat: Chat;
  currentUserId?: string;
  isChatActive: boolean;
  haveUnreadMessages: boolean;
}

const ChatListItem = ({ chat, currentUserId, isChatActive, haveUnreadMessages }: ChatListItemProps) => {
  const router = useRouter();
  const partner = chat.isGroupChat
    ? { name: chat.name, avatar: chat.avatar || "" }
    : chat.users.find((u) => u._id !== currentUserId);

  const user = chat.isGroupChat ? null : chat.users.find(chat => chat._id !== currentUserId)

  if (!partner) return null;

  return (
    <button
      onClick={() => router.push(`/?chatId=${chat._id}`)}
      className={cn(
        "relative w-full flex items-center gap-3 px-3 py-2 rounded-lg transition text-left cursor-pointer",
        "hover:bg-background-accent/50",
        isChatActive && "bg-primary/5 border border-l-4 border-primary/30 font-semibold",
        haveUnreadMessages && "bg-primary/5"
      )}
    >
      <AvatarDiv user={user} />

      < div className="flex flex-col overflow-hidden">
        <span className="text-sm font-medium text-foreground truncate">
          {partner.name}
        </span>
        {chat.latestMessage?.content ? (
          <span className="text-xs text-foreground-accent truncate max-w-[180px]">
            {chat.latestMessage.content}
          </span>
        ) : (
          <span className="text-xs text-foreground-accent truncate max-w-[180px]">
            Say Hello
          </span>
        )}
      </div>
      {
        haveUnreadMessages && <div className="bg-primary w-3 h-3 rounded-full absolute top-1/2 right-3 -translate-y-1/2"></div>
      }
    </button>
  );
};

export default ChatListItem;
