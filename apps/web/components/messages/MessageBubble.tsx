"use client";

import { useUserStore } from "@/store/useUserStore";
import { MessageWithSender } from "@workspace/database";
import { cn } from "@workspace/ui/lib/utils";
import { memo } from "react";
import MessageActionWrapper from "./MessageActionsWrapper";
import MessageBubbleShape from "./MessageBubbleShape";
import { RenderMessageContent } from "./RenderMessageContent";
import ReplyComponent from "./ReplyComponent";

const MessageBubble = memo(({ message }: { message: MessageWithSender }) => {
  const currentUser = useUserStore((s) => s.currentUser);
  const isOwnMessage = message.sender._id === currentUser?._id;
  const isNote = message.messageType === "note";
  const isMedia = message.messageType === "media";

  return (
    <li
      className={cn(
        "flex w-full select-none",
        isOwnMessage ? "justify-end" : "justify-start",
        isNote && "justify-center"
      )}
    >
      {isNote ? (
        <RenderMessageContent message={message} isOwnMessage={isOwnMessage} />
      ) : (
        <MessageActionWrapper message={message} isOwnMessage={isOwnMessage}>
          <MessageBubbleShape type={isOwnMessage ? "right" : "left"} media={isMedia}>
            {message.replyTo && (<ReplyComponent reply={message.replyTo} variant="view" className="mb-1" />)}
            <RenderMessageContent message={message} isOwnMessage={isOwnMessage} />
          </MessageBubbleShape>
        </MessageActionWrapper>
      )}
    </li>
  );
});

MessageBubble.displayName = "MessageBubble";
export default MessageBubble;
