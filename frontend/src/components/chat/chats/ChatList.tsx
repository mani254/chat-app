import { Skeleton } from "@/components/ui/skeleton";
import { useChatStore } from "@/src/store/useChatStore";
import { useUserStore } from "@/src/store/useUserStore";
import ChatListItem from "./ChatListItem";
import NoChatsFound from "./NoChatsFound";
import NoGroupsFound from "./NoGroupsFound";
;

const ChatList = ({ chats, search, type }: { chats: any[]; search: string, type: 'chat' | 'group' }) => {
  const loadingChats = useChatStore((s) => s.loadingChats);
  const currentUser = useUserStore((s) => s.currentUser);
  const activeChat = useChatStore((s) => s.activeChat);

  if (loadingChats && chats.length === 0) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg bg-background-accent" />
        ))}
      </>
    );
  }

  if (chats.length === 0) {
    if (type === 'chat') {
      return <NoChatsFound search={search} />;
    }
    if (type = "group") {
      return <NoGroupsFound search={search} />;
    }
  }

  return (
    <>
      {chats.map((chat) => {
        const isChatActive = activeChat?._id === chat._id;
        const haveUnreadMessages =
          !!chat.latestMessage &&
          Array.isArray(chat.latestMessage.readBy) &&
          !chat.latestMessage.readBy.includes(currentUser?._id || "");

        return (
          <ChatListItem
            key={chat._id}
            chat={chat}
            currentUserId={currentUser?._id}
            isChatActive={isChatActive}
            haveUnreadMessages={haveUnreadMessages}
          />
        );
      })}
    </>
  );
};

export default ChatList;
