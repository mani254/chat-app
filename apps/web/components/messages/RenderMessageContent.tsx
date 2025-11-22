// src/components/messages/renderMessageContent.tsx
"use client";

import { useChatStore } from "@/store/useChatStore";
import { formatTime } from "@/utils/formaters";
import { MessageWithSender } from "@workspace/database";
import { cn } from "@workspace/ui/lib/utils";
import MediaGridView from "./MediaGridView";

export function RenderMessageContent({
  message,
  isOwnMessage,
  showMeta = true,
}: {
  message: MessageWithSender;
  isOwnMessage?: boolean;
  showMeta?: boolean;
}) {
  const isText = message.messageType === "text";
  const isMedia = message.messageType === "media";
  const isNote = message.messageType === "note";

  const currentChat = useChatStore((s) => s.activeChat);

  if (isNote) {
    return (
      <div className="max-w-[75%] px-3 py-1 rounded-2xl border border-border text-[11px] bg-background">
        {message.content}
      </div>
    );
  }

  if (isText) {
    return (
      <div className="pb-1 pr-[56px] relative">
        <p className="text-[15px] select-none">{message.content}</p>
        {showMeta && (
          <span
            className={cn(
              "absolute bottom-0 right-1 text-[10px] select-none",
              isOwnMessage
                ? "text-primary-invert"
                : "text-foreground-accent/85"
            )}
          >
            {formatTime(message.createdAt)}
          </span>
        )}
      </div>
    );
  }

  if (isMedia) {
    const mediaData = message.mediaLinks.map((link) => ({ url: link }));
    return (
      <div className="relative z-20 cursor-pointer">
        <MediaGridView items={mediaData} />
      </div>
    );
  }

  return null;
}
