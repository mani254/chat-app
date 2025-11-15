import { useChatStore } from "@/store/useChatStore";
import { useUserStore } from "@/store/useUserStore";
import { PopulatedChatDocument } from "@workspace/database";
import { Skeleton } from "@workspace/ui/components/skeleton";
import NoGroupsFound from "../group/NoGroupFound";
import ChatListItem from "./ChatlistItem";
import NoChatsFound from "./NoChatFound";

const ChatsList = ({ chats, search, type }: { chats: PopulatedChatDocument[], search: string, type: 'group' | 'chat' }) => {

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
    if (type === "group") {
      return <NoGroupsFound search={search} />;
    }
  }

  return (
    <>
      {chats.map((chat) => {
        const isChatActive = activeChat?._id === chat._id;

        const { latestMessage } = chat;
        const userId = currentUser?._id;

        const haveUnreadMessages = Boolean(
          latestMessage?.readBy &&
          Array.isArray(latestMessage.readBy) &&
          userId &&
          !latestMessage.readBy.includes(userId)
        );

        return (
          <ChatListItem key={chat._id.toString()} chat={chat} currentUserId={currentUser?._id.toString()} isChatActive={isChatActive} haveUnreadMessages={haveUnreadMessages} />
        );
      })}
    </>
  )
}

export default ChatsList
