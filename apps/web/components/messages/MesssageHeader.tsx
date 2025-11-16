"use client";

import useMediaQuery from "@/hooks/useMediaQuery";
import { useMessageActionsStore } from "@/store/useMessageActionsStore";
import { useReplyStore } from "@/store/useReplyStore";
import { useUserStore } from "@/store/useUserStore";
import { mobileWidth } from "@/utils";
import { copyToClipboard } from "@/utils/functions";
import { PopulatedChatDocument } from "@workspace/database";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowLeft, Info, Phone, Video, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import AvatarDiv from "../common/AvatarDiv";
import FeatureComingSoonModal from "../common/FeatureCommingSoonModal";
import GroupAvatarDiv from "../common/GroupAvatarDiv";
import MessageActions from "./MessageActions";

const MessageHeader = ({ chat }: { chat: PopulatedChatDocument }) => {
  const router = useRouter();
  const currentUser = useUserStore((s) => s.currentUser);
  const activeUsers = useUserStore((s) => s.activeUsers);
  const isDesktop = useMediaQuery(`(min-width: ${mobileWidth}px)`);

  console.log(activeUsers, 'activeUsers')

  const [openFeatureCommingSoonModal, setOpenFeatureCommingSoonModal] =
    useState(false);

  // 🌍 Global store for message actions
  const setReplyTo = useReplyStore(s => s.setReplyTo)
  const { showMessageActions, currentMessage, closeMessageActions } =
    useMessageActionsStore();

  const isGroupChat = chat.isGroupChat;

  /** PARTNER DATA */
  const partner = useMemo(() => {
    if (isGroupChat) {
      const onlineUsers = chat.users.filter((u) =>
        activeUsers.some((au) => au._id === u._id)
      );
      return {
        name: chat.name,
        avatar: chat.avatar || "",
        onlineUsers: onlineUsers || [],
        isOnline: true,
      };
    }

    const user = chat.users.find((u) => u._id !== currentUser?._id);
    const isOnline = activeUsers.some((au) => au._id === user?._id);

    return {
      ...user,
      isOnline,
      onlineUsers: [],
    };
  }, [chat, currentUser, activeUsers, isGroupChat]);

  /** STATUS TEXT */
  const statusText = isGroupChat
    ? partner.onlineUsers.length === 0
      ? "No one online"
      : `${partner.onlineUsers.length} active`
    : partner.isOnline
      ? "Active now"
      : "Offline";

  /** STATUS COLOR */
  const statusColor =
    !isGroupChat && partner.isOnline
      ? "text-green-500"
      : "text-muted-foreground";

  const handleBack = () => router.push("/");

  return (
    <>
      <header
        className={cn(
          "h-16 flex items-center justify-between px-4 border-b border-background-accent bg-background transition-all"
        )}
      >
        {/* Left Section */}
        <div className="flex items-center gap-3" >
          {/* Back or Close */}
          <button
            className="p-2 rounded-full bg-background-accent md:hidden"
            onClick={
              showMessageActions && !isDesktop
                ? closeMessageActions // back to normal header if actions are open
                : handleBack
            }
          >
            {showMessageActions && !isDesktop ? (
              <X size={19} />
            ) : (
              <ArrowLeft size={19} />
            )}
          </button>

          {/* Avatar */}
          {isGroupChat ? (
            <GroupAvatarDiv chat={chat} />
          ) : (
            <AvatarDiv user={partner as any} />
          )}

          {/* Chat Info */}
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {partner.name || "Unknown User"}
            </span>

            <span
              className={`text-xs flex items-center gap-1 ${statusColor}`}
            >
              {!isGroupChat && partner.isOnline && (
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              )}
              {statusText}
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div data-message-actions>
          {/* 📱 Only show actions here if mobile */}
          {!isDesktop && showMessageActions && currentMessage ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <MessageActions
                onCopy={() => {
                  copyToClipboard(currentMessage?.content);
                  closeMessageActions();
                }}
                onForward={() => {
                  closeMessageActions();
                }}
                onReply={() => {
                  setReplyTo(currentMessage)
                  closeMessageActions();
                }}
                onReact={() => {
                  closeMessageActions();
                }}
              />
            </div>
          ) : (
            // 💻 Desktop icons (always visible)
            <div className="flex items-center gap-2">
              {[Phone, Video, Info].map((Icon, i) => (
                <button
                  key={i}
                  className="p-2 rounded-full bg-background-accent hover:bg-background-accent/80 transition"
                  onClick={() => {
                    console.log('any one of them is clicked')
                    setOpenFeatureCommingSoonModal(true)
                  }}
                >
                  <Icon size={19} />
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <FeatureComingSoonModal
        open={openFeatureCommingSoonModal}
        onOpenChange={setOpenFeatureCommingSoonModal}
      />
    </>
  );
};

export default MessageHeader;
