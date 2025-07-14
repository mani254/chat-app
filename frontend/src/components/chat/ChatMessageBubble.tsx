import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Paperclip } from "lucide-react";
import Image from "next/image";

interface ChatMessageBubbleProps {
  message: any;
  isOwn: boolean;
  showName: boolean;
}

const formatMessageTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const ChatMessageBubble = ({ message, isOwn, showName }: ChatMessageBubbleProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("flex gap-2", isOwn ? "justify-end" : "justify-start")}
  >
    {!isOwn && (
      <Avatar className="w-8 h-8">
        <AvatarImage src={message.sender.avatar} />
        <AvatarFallback>
          {message.sender.name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
    )}
    <div className={cn("max-w-xs lg:max-w-md", isOwn ? "text-right" : "text-left")}>      {showName && (
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-3">
        {message.sender.name}
      </p>
    )}
      <div
        className={cn(
          "inline-block px-4 py-2 rounded-2xl max-w-full break-words",
          isOwn ? "bg-blue-600 text-white" : "bg-background"
        )}
      >
        {message.messageType === "text" && (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}
        {message.messageType === "image" && (
          <Image src={message.content} alt="Shared image" width={300} height={300} className="rounded-lg max-w-full h-auto" />
        )}
        {message.messageType === "file" && (
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            <span className="text-sm">{message.content}</span>
          </div>
        )}
      </div>
      <div className={cn("text-xs text-gray-500 dark:text-gray-400 mt-1", isOwn ? "text-right" : "text-left")}>        <span>{formatMessageTime(message.createdAt)}</span>
        {isOwn && (
          <span className="ml-1 text-blue-600">{message.readBy.length > 1 ? "✓✓" : "✓"}</span>
        )}
      </div>
    </div>
  </motion.div>
);

export default ChatMessageBubble;
