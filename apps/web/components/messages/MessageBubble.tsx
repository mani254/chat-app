"use client";

import useMediaQuery from "@/hooks/useMediaQuery";
import { useMessageActionsStore } from "@/store/useMessageActionsStore";
import { useReplyStore } from "@/store/useReplyStore";
import { useUserStore } from "@/store/useUserStore";
import { mobileWidth } from "@/utils";
import { formatTime } from "@/utils/formaters";
import { copyToClipboard } from "@/utils/functions";
import { MessageWithSender } from "@workspace/database";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import { memo, useEffect, useRef, useState } from "react";
import MediaGridView from "./MediaGridView";
import MessageActions from "./MessageActions";
import MessageBubbleShape from "./MessageBubbleShape";

/**
 * ⚡ Optimized MessageBubble
 * Handles both desktop (popover) and mobile (header actions) interactions.
 * Memoized for large chat lists.
 */
const MessageBubble = memo(({ message }: { message: MessageWithSender }) => {
  const currentUser = useUserStore((s) => s.currentUser);
  const setReplyTo = useReplyStore((s) => s.setReplyTo);

  // ✅ Selective Zustand subscriptions to prevent unnecessary re-renders
  const openMessageActions = useMessageActionsStore((s) => s.openMessageActions);
  const closeMessageActions = useMessageActionsStore((s) => s.closeMessageActions);
  const showMobileMessageActions = useMessageActionsStore((s) => s.showMessageActions);
  const activeMessageId = useMessageActionsStore((s) => s.currentMessage?._id);

  const isDesktop = useMediaQuery(`(min-width: ${mobileWidth}px)`);

  // ✅ Local popover state (for desktop only)
  const [showPopover, setShowPopover] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const isOwnMessage = message.sender._id === currentUser?._id;
  const isNote = message.messageType === "note";
  const isText = message.messageType === "text";
  const isMedia = message.messageType === "media";
  const mediaData = message.mediaLinks.map((link) => ({ url: link }));

  // ==============================
  // 🎯 EVENT HANDLERS
  // ==============================

  const handleMouseDown = () => {
    if (!isDesktop) {
      longPressTimer.current = setTimeout(() => {
        openMessageActions(message);
      }, 500);
    }
  };

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isDesktop) {
      e.preventDefault();
      setShowPopover(true);
    }
  };

  // ==============================
  // 🧠 LIFECYCLE EFFECTS
  // ==============================

  useEffect(() => {
    // Close on scroll
    const handleScroll = () => {
      setShowPopover(false);
      closeMessageActions();
    };

    // 📱 Mobile: close global actions if tapping outside
    const handleTouchStart = (e: TouchEvent) => {
      if (!isDesktop && showMobileMessageActions && activeMessageId) {
        const target = e.target as HTMLElement;
        const insideBubble = target.closest(`[data-message-id="${activeMessageId}"]`);
        if (!insideBubble) closeMessageActions();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("touchstart", handleTouchStart);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, [isDesktop, showMobileMessageActions, activeMessageId, closeMessageActions]);

  // ==============================
  // 💬 RENDER
  // ==============================
  return (
    <li
      data-message-id={message._id}
      className={cn(
        "flex w-full select-none",
        isOwnMessage ? "justify-end" : "justify-start",
        isNote && "justify-center"
      )}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseUp={clearLongPress}
      onMouseLeave={clearLongPress}
      onTouchStart={handleMouseDown}
      onTouchEnd={clearLongPress}
      onTouchCancel={clearLongPress}
    >
      {/* 📝 Note Message */}
      {isNote && (
        <div className="max-w-[75%] px-3 py-1 rounded-2xl border border-border text-[11px] bg-background">
          {message.content}
        </div>
      )}

      {/* 💬 Text Message */}
      {isText && (
        <MessageBubbleShape type={isOwnMessage ? "right" : "left"}>
          {isDesktop ? (
            // 💻 Desktop popover
            <Popover
              open={showPopover}
              onOpenChange={(open) => {
                if (!open) {
                  setShowPopover(false);
                  closeMessageActions();
                }
              }}
            >
              <PopoverTrigger asChild>
                <div className="pb-1 pr-[50px] relative" tabIndex={0}>
                  <p className="text-[15px] select-none">{message.content}</p>
                  <span
                    className={cn(
                      "absolute bottom-0.5 right-2 text-[10px] select-none",
                      isOwnMessage
                        ? "text-primary-accent/85"
                        : "text-foreground-accent/85"
                    )}
                  >
                    {formatTime(message.createdAt)}
                  </span>
                </div>
              </PopoverTrigger>

              <PopoverContent
                className="p-0 w-40"
                side={isOwnMessage ? "left" : "right"}
                align="start"
                sideOffset={12}
              >
                <MessageActions
                  onCopy={() => {
                    copyToClipboard(message.content);
                    setShowPopover(false);
                  }}
                  onForward={() => {
                    console.log("Forward clicked", message);
                    setShowPopover(false);
                  }}
                  onReply={() => {
                    setReplyTo(message);
                    setShowPopover(false);
                  }}
                  onReact={() => {
                    console.log("React clicked", message);
                    setShowPopover(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          ) : (
            // 📱 Mobile — no popover, triggers global header actions
            <div className="pb-1 pr-[50px] relative">
              <p className="text-[15px] select-none">{message.content}</p>
              <span
                className={cn(
                  "absolute bottom-0.5 right-2 text-[10px] select-none",
                  isOwnMessage
                    ? "text-primary-accent/85"
                    : "text-foreground-accent/85"
                )}
              >
                {formatTime(message.createdAt)}
              </span>
            </div>
          )}
        </MessageBubbleShape>
      )}

      {/* 🖼️ Media Message */}
      {isMedia && (
        <MessageBubbleShape
          type={isOwnMessage ? "right" : "left"}
          media={true}
        >
          <div className="relative z-20">
            <MediaGridView items={mediaData} />
          </div>
        </MessageBubbleShape>
      )}
    </li>
  );
});

MessageBubble.displayName = "MessageBubble";
export default MessageBubble;
