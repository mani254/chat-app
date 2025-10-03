import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Paperclip } from "lucide-react";
import Image from "next/image";
import AvatarDiv from "../../ui/Avatar";

interface ChatMessageBubbleProps {
  message: any;
  isOwn: boolean;
  showName: boolean;
  systemMessage: boolean; // Add this prop for system message
}

const formatMessageTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const ChatMessageBubble = ({ message, isOwn, showName, systemMessage }: ChatMessageBubbleProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("flex gap-2 relative", isOwn ? "justify-end" : "justify-start", systemMessage && "justify-center")}
  >
    {!isOwn && !message.midText && (
      <div className="flex items-end pb-1">
        <AvatarDiv user={message.sender} className="w-5 h-5" />
      </div>
    )}
    <div className={cn("max-w-xs lg:max-w-md", isOwn ? "text-right" : "text-left", systemMessage && "text-center")}>
      {showName && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-3">
          {message.sender.name}
        </p>
      )}
      <div
        className={cn(
          "relative inline-block px-4 py-2 rounded-2xl max-w-full break-words shadow-sm",
          isOwn
            ? "bg-primary text-white rounded-br-sm message-bubble-own"
            : "bg-background-accent rounded-bl-sm message-bubble-other border border-border/60",
          systemMessage && "bg-background-accent/60 text-foreground-accent py-1 shadow-none border-0"
        )}
      >
        {(message.messageType === "text") && (
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
        {(message.messageType === "note") && (
          <p className="text-xs whitespace-pre-wrap ">{message.content}</p>
        )}
      </div>
      {!message.midText && (
        <div className={cn("text-xs text-foreground-accent mt-1", isOwn ? "text-right" : "text-left")}>
          <span>{formatMessageTime(message.createdAt)}</span>
          {isOwn && (
            <span className="ml-1 text-primary">{message.readBy.length > 1 ? "✓✓" : "✓"}</span>
          )}
        </div>
      )}
    </div>
  </motion.div>
);

export default ChatMessageBubble;
