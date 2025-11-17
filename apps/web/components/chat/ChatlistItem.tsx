"use client";

import { useUIStore } from "@/store/useUIStore";
import { getTimeAgo } from "@/utils/formaters";
import { PopulatedChatDocument } from "@workspace/database";
import { cn } from "@workspace/ui/lib/utils";
import { useRouter } from "next/navigation";
import AvatarDiv from "../common/AvatarDiv";
import GroupAvatarDiv from "../common/GroupAvatarDiv";

interface ChatListItemProps {
  chat: PopulatedChatDocument;
  currentUserId?: string;
  isChatActive: boolean;
  haveUnreadMessages: boolean;
}

const ChatListItem = ({ chat, currentUserId, isChatActive, haveUnreadMessages }: ChatListItemProps) => {
  const router = useRouter();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const partner = chat.isGroupChat
    ? { name: chat.name, avatar: chat.avatar }
    : chat.users.find((u) => u._id.toString() !== currentUserId);

  if (!partner) return null;

  return (
    <button
      onClick={() => {
        router.push(`/chat/${chat._id}`);
        if (window.innerWidth < 768) toggleSidebar();
      }}
      className={cn(
        "flex items-center gap-3 px-1 py-3 w-full rounded-xl group transition relative cursor-pointer border-b border-border",
        "hover:bg-background-accent/50",
        isChatActive && "bg-primary/10 hover:bg-primary/10 border border-primary/20"
      )}
    >
      {chat.isGroupChat ? (
        <GroupAvatarDiv chat={chat} />
      ) : (
        <AvatarDiv user={partner as any} showActiveDot />
      )}

      {/* Text Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <span
            className={cn(
              "text-sm font-medium truncate",
              isChatActive ? "text-primary" : "text-foreground"
            )}
          >
            {partner.name}
          </span>
          <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
            {getTimeAgo(chat.latestMessage?.createdAt || "")}
          </span>
        </div>

        <span
          className={cn(
            "text-xs truncate text-start",
            isChatActive ? "text-primary/80" : "text-muted-foreground"
          )}
        >
          {chat.latestMessage?.content === "New Chat Was Created" ? "Say hello 👋" : chat.latestMessage?.content}
        </span>
      </div>

      {haveUnreadMessages && (
        <div className="absolute right-3 bottom-3 w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
      )}
    </button>
  );
};

export default ChatListItem;
