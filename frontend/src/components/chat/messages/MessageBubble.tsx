"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useReplyStore } from "@/src/store/useReplyStore";
import { Message } from "@/src/types";
import { motion } from "framer-motion";
import { Paperclip } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import AvatarDiv from "../../ui/Avatar";
import MessageActions from "./MessageActions";
import ReplyPreview from "./ReplyToPreview";

interface ChatMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showName: boolean;
  systemMessage: boolean;
}

const formatMessageTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const ChatMessageBubble = ({
  message,
  isOwn,
  showName,
  systemMessage,
}: ChatMessageBubbleProps) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const setReplyTo = useReplyStore((s) => s.setReplyTo);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isOwn) return; // don't trigger on own messages
    e.preventDefault();
    setOpen(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isOwn) return; // don't trigger on own messages
    e.preventDefault();
    setOpen(true);
  };

  // bubble content
  const bubbleContent = (
    <div
      ref={triggerRef}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
      className={cn(
        "relative inline-block px-4 py-2 rounded-2xl max-w-full break-words shadow-sm cursor-pointer",
        isOwn
          ? "bg-primary text-white rounded-br-sm message-bubble-own"
          : "bg-background-accent rounded-bl-sm message-bubble-other border border-border/60",
        systemMessage &&
        "bg-background-accent/60 text-foreground-accent py-1 shadow-none border-0"
      )}
    >
      {message.messageType === "text" && (
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      )}
      {message.messageType === "image" && (
        <Image
          src={message.content}
          alt="Shared image"
          width={300}
          height={300}
          className="rounded-lg max-w-full h-auto"
        />
      )}
      {message.messageType === "file" && (
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4" />
          <span className="text-sm">{message.content}</span>
        </div>
      )}
      {message.messageType === "note" && (
        <p className="text-xs whitespace-pre-wrap">{message.content}</p>
      )}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}>
      {message?.replyTo && <div className="flex justify-end">
        <ReplyPreview replyTo={message.replyTo} view={true} />
      </div>}
      <div
        className={cn(
          "flex gap-2 relative",
          isOwn ? "justify-end" : "justify-start",
          systemMessage && "justify-center"
        )}
      >
        {!isOwn && !message.midText && (
          <div className="flex items-end pb-1">
            <AvatarDiv user={message.sender} className="w-5 h-5" />
          </div>
        )}

        <div
          className={cn(
            "max-w-xs lg:max-w-md",
            isOwn ? "text-right" : "text-left",
            systemMessage && "text-center"
          )}
        >
          {showName && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-3">
              {message.sender.name}
            </p>
          )}

          {/* Only show popover for others' messages */}
          {!isOwn ? (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>{bubbleContent}</PopoverTrigger>
              <PopoverContent
                className="p-0 w-40"
                side="top"
                align="center"
                sideOffset={8}
              >
                <MessageActions
                  onCopy={() => {
                    navigator.clipboard.writeText(message.content);
                    setOpen(false);
                  }}
                  onForward={() => {
                    console.log("Forward clicked", message);
                    setOpen(false);
                  }}
                  onReply={() => {
                    console.log("Reply clicked", message);
                    setReplyTo(message)
                    setOpen(false);
                  }}
                  onReact={() => {
                    console.log("React clicked", message);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          ) : (
            bubbleContent
          )}

          {/* time */}
          {!message.midText && (
            <div
              className={cn(
                "text-xs text-foreground-accent mt-1",
                isOwn ? "text-right" : "text-left"
              )}
            >
              <span>{formatMessageTime(message.createdAt)}</span>
              {isOwn && (
                <span className="ml-1 text-primary">
                  {message.readBy.length > 1 ? "✓✓" : "✓"}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>

  );
};

export default ChatMessageBubble;
