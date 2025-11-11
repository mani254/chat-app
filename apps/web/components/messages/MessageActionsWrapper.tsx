"use client";

import useMediaQuery from "@/hooks/useMediaQuery";
import { useMessageActionsStore } from "@/store/useMessageActionsStore";
import { useReplyStore } from "@/store/useReplyStore";
import { mobileWidth } from "@/utils";
import { copyToClipboard } from "@/utils/functions";
import { MessageWithSender } from "@workspace/database";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { useEffect, useRef, useState } from "react";
import MessageActions from "./MessageActions";

interface MessageActionWrapperProps {
  message: MessageWithSender;
  isOwnMessage?: boolean;
  children: React.ReactNode;
}

const MessageActionWrapper = ({ message, isOwnMessage, children }: MessageActionWrapperProps) => {
  const isDesktop = useMediaQuery(`(min-width: ${mobileWidth}px)`);
  const openMessageActions = useMessageActionsStore((s) => s.openMessageActions);
  const closeMessageActions = useMessageActionsStore((s) => s.closeMessageActions);
  const showMobileMessageActions = useMessageActionsStore((s) => s.showMessageActions);
  const activeMessageId = useMessageActionsStore((s) => s.currentMessage?._id);
  const setReplyTo = useReplyStore((s) => s.setReplyTo);

  const [showPopover, setShowPopover] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // =======================
  // 🎯 Event Handlers
  // =======================
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

  // Note: we attach the contextmenu handler to the PopoverTrigger child (see below)
  // so we don't interfere with children that might also handle contextmenu.

  // =======================
  // 🧠 Lifecycle
  // =======================
  useEffect(() => {
    const handleScroll = () => {
      setShowPopover(false);
      closeMessageActions();
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!isDesktop && showMobileMessageActions && activeMessageId) {
        const target = e.target as HTMLElement;
        const insideBubble = target.closest(`[data-message-id="${activeMessageId}"]`);
        const insideActions = target.closest('[data-message-actions]'); // <- new
        if (!insideBubble && !insideActions) closeMessageActions();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("touchstart", handleTouchStart);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, [isDesktop, showMobileMessageActions, activeMessageId, closeMessageActions]);

  // =======================
  // 💬 Render
  // =======================
  return (
    <div
      data-message-id={message._id}
      // keep pointer/touch handlers on the wrapper (so long-press works)
      onMouseDown={handleMouseDown}
      onMouseUp={clearLongPress}
      onMouseLeave={clearLongPress}
      onTouchStart={handleMouseDown}
      onTouchEnd={clearLongPress}
      onTouchCancel={clearLongPress}
      className="relative"
    >
      {isDesktop ? (
        <Popover
          open={showPopover}
          onOpenChange={(open) => {
            // mirror the controlled state and also close the global store when closed
            setShowPopover(open);
            if (!open) closeMessageActions();
          }}
        >
          {/* PopoverTrigger must receive a focusable element; we add tabIndex and attach contextmenu here */}
          <PopoverTrigger asChild>
            <div
              tabIndex={0}
              // prevent default native context menu and open our popover
              onContextMenu={(e) => {
                e.preventDefault();
                // if mobile store was open, close it (defensive)
                if (showMobileMessageActions) closeMessageActions();
                setShowPopover(true);
              }}
            >
              {children}
            </div>
          </PopoverTrigger>

          <PopoverContent
            className="p-0 w-40 z-9999" // ensure visible above other UI
            side={isOwnMessage ? "left" : "right"}
            align="start"
            sideOffset={12}
          >
            <MessageActions
              onCopy={() => {
                copyToClipboard(message.content || message.mediaLinks.join(", "));
                setShowPopover(false);
              }}
              onForward={() => {
                setShowPopover(false);
              }}
              onReply={() => {
                setReplyTo(message);
                setShowPopover(false);
              }}
              onReact={() => {
                setShowPopover(false);
              }}
            />
          </PopoverContent>
        </Popover>
      ) : (
        <>{children}</>
      )}
    </div>
  );
};

export default MessageActionWrapper;
