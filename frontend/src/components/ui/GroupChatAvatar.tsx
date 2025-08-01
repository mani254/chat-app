import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Chat } from "@/src/types";
import clsx from "clsx";
// make sure Chat type includes avatar and name

interface GroupChatAvatarProps {
  chat: Pick<Chat, "avatar" | "name">;
  className?: string;
}

const GroupChatAvatar = ({ chat, className = "" }: GroupChatAvatarProps) => {
  return (
    <div className={clsx("inline-block rounded-full", className || "w-8 h-8")}>
      <Avatar className="aspect-square transition-all w-full h-full">
        <AvatarImage src={chat.avatar} />
        <AvatarFallback>
          {chat.name?.charAt(0)?.toUpperCase()}
          {chat.name?.charAt(1)?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default GroupChatAvatar;
