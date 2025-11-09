"use client";

import useMediaQuery from "@/hooks/useMediaQuery";
import { mobileWidth } from "@/utils";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Copy, Reply, Share2, Smile } from "lucide-react";
import { useState } from "react";
import FeatureComingSoonModal from "../common/FeatureCommingSoonModal";

interface MessageActionsProps {
  onCopy: () => void;
  onReply: () => void;
  onForward: () => void;
  onReact: () => void;
}

const MessageActions = ({
  onCopy,
  onReply,
  onForward,
  onReact,
}: MessageActionsProps) => {
  const [openFeatureCommingSoonModal, setOpenFeatureCommingSoonModal] =
    useState(false);

  // 📱 detect mobile view
  const isDesktop = useMediaQuery(`(min-width: ${mobileWidth}px)`);

  return (
    <div
      className={cn(
        "bg-background",
        isDesktop
          ? "flex flex-col p-2 w-40" // 💻 Desktop layout
          : "flex flex-row justify-around items-center py-2 px-4 w-full" // 📱 Mobile layout
      )}
    >
      {/* Copy */}
      <Button
        variant="ghost"
        size={isDesktop ? "sm" : "icon"}
        className={cn(
          isDesktop ? "justify-start" : "flex items-center justify-center"
        )}
        onClick={onCopy}
      >
        <Copy className={isDesktop ? "w-4 h-4 mr-2" : "w-5 h-5"} />
        {isDesktop && "Copy"}
      </Button>

      {/* Forward */}
      <Button
        variant="ghost"
        size={isDesktop ? "sm" : "icon"}
        className={cn(
          isDesktop ? "justify-start" : "flex items-center justify-center"
        )}
        onClick={() => setOpenFeatureCommingSoonModal(true)}
      >
        <Share2 className={isDesktop ? "w-4 h-4 mr-2" : "w-5 h-5"} />
        {isDesktop && "Forward"}
      </Button>

      {/* Reply */}
      <Button
        variant="ghost"
        size={isDesktop ? "sm" : "icon"}
        className={cn(
          isDesktop ? "justify-start" : "flex items-center justify-center"
        )}
        onClick={onReply}
      >
        <Reply className={isDesktop ? "w-4 h-4 mr-2" : "w-5 h-5"} />
        {isDesktop && "Reply"}
      </Button>

      {/* React */}
      <Button
        variant="ghost"
        size={isDesktop ? "sm" : "icon"}
        className={cn(
          isDesktop ? "justify-start" : "flex items-center justify-center"
        )}
        onClick={() => setOpenFeatureCommingSoonModal(true)}
      >
        <Smile className={isDesktop ? "w-4 h-4 mr-2" : "w-5 h-5"} />
        {isDesktop && "React"}
      </Button>

      {/* Coming soon modal */}
      <FeatureComingSoonModal
        open={openFeatureCommingSoonModal}
        onOpenChange={setOpenFeatureCommingSoonModal}
      />
    </div>
  );
};

export default MessageActions;
