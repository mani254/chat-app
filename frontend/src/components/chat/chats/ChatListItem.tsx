"use client";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/src/store/useUiStore";
import { Chat } from "@/src/types";
import { getTimeAgo } from "@/src/utils/formator";
import { useRouter } from "next/navigation";
import AvatarDiv from "../../ui/Avatar";
import GroupChatAvatar from "../../ui/GroupChatAvatar";

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

  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  if (!partner) return null;

  return (
    <button
      onClick={() => {
        router.push(`/?chatId=${chat._id}`)
        if (window.innerWidth < 768) toggleSidebar();
      }}
      className={cn(
        "relative w-full flex items-center gap-2 px-3 py-2 rounded-lg transition text-left cursor-pointer border-b border-background-accent",
        "hover:bg-background-accent/50",
        isChatActive && "bg-primary/15 border border-l-4 border-primary/30 font-semibold hover:bg-primary/15",
      )}
    >

      {chat.isGroupChat ? <GroupChatAvatar chat={chat} /> : <AvatarDiv user={user} showActiveDot={true} />}

      < div className="flex flex-col overflow-hidden">
        <span className={cn("text-sm font-medium text-foreground truncate",
          isChatActive && "text-primary/80 font-semibold",
        )}>
          {partner.name}
        </span>
        {chat.latestMessage?.content ? (
          <span className={cn("text-xs text-foreground-accent truncate max-w-[180px] mt-1",
            isChatActive && "text-primary/70",
          )}>
            {chat.latestMessage.content}
          </span>
        ) : (
          <span className="text-xs text-foreground-accent truncate max-w-[180px] mt-1">
            Say Hello
          </span>
        )}
      </div>
      {
        haveUnreadMessages && <div className="bg-primary w-2 h-2 rounded-full absolute bottom-3 right-3"></div>
      }
      {
        <div className={cn("text-xs text-foreground-accent truncate max-w-[180px] absolute top-2 right-3")}>
          {getTimeAgo(chat.latestMessage?.createdAt || "")}
        </div>
      }
    </button>
  );
};

export default ChatListItem;
