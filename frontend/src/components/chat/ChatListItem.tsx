import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Chat } from "@/src/types";
import { motion } from "framer-motion";

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  currentUserId?: string;
  setCurrentChat: (chat: Chat) => void;
  toggleSidebar: () => void;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return diff < 24
    ? date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getChatDetails = (chat: Chat, currentUserId?: string, type: "name" | "avatar" = "name") => {
  if (chat.isGroupChat) {
    return type === "avatar" ? chat.avatar : chat.name;
  }
  const other = chat.users.find((u) => u._id !== currentUserId);
  return type === "avatar" ? other?.avatar : other?.name;
};

const ChatListItem = ({ chat, isActive, currentUserId, setCurrentChat, toggleSidebar }: ChatListItemProps) => {
  const chatName = getChatDetails(chat, currentUserId, "name");
  const chatImage = getChatDetails(chat, currentUserId, "avatar");
  const latestMsg = chat.latestMessage;
  const isUnread =
    currentUserId &&
    latestMsg &&
    !latestMsg.readBy.includes(currentUserId);

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        variant="ghost"
        className={cn(
          "w-full p-3 h-auto justify-start text-left hover:bg-background-accent rounded-lg mb-1 cursor-pointer",
          isActive && "bg-primary-accent"
        )}
        onClick={() => {
          setCurrentChat(chat);
          if (window.innerWidth < 1024) toggleSidebar();
        }}
      >
        <div className="flex items-center gap-3 w-full">
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarImage src={chatImage} />
              <AvatarFallback>
                {chatName?.charAt(0).toUpperCase() || "UN"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3
                className={cn(
                  "font-medium text-sm truncate",
                  isActive ? "text-primary" : "text-foreground"
                )}
              >
                {chatName}
              </h3>
              {latestMsg && (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {formatTime(latestMsg.createdAt)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p
                className={cn(
                  "text-xs truncate",
                  isUnread
                    ? "text-gray-900 dark:text-white font-medium"
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                {latestMsg?.content ? latestMsg.content : "say hello"}
              </p>
              {isUnread && (
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2" />
              )}
            </div>
          </div>
        </div>
      </Button>
    </motion.div>
  );
};

export default ChatListItem;
