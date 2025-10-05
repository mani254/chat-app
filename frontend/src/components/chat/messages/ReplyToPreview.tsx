"use client";

import { cn } from "@/lib/utils";
import { MessageWithoutChat } from "@/src/types";
import { X } from "lucide-react";
import MediaGridPreview from "./MediaGridPreview";

interface ReplyPreviewProps {
  replyTo: MessageWithoutChat;
  onCancel?: () => void;
  className?: string;
  view?: boolean
}

const truncateText = (text: string, maxLength = 80) => {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

const ReplyPreview = ({ replyTo, onCancel, className, view = true }: ReplyPreviewProps) => {
  if (!replyTo) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-2 px-3 py-2 mb-1 rounded-lg border border-border/50 bg-background-accent/50 text-xs cursor-pointer hover:bg-background-accent/70 transition-colors relative",
        className
      )}
    >
      {!view && <div className="absolute top-2 right-2" onClick={onCancel}>
        <X />
      </div>}
      <div className="w-1 bg-primary rounded-full mt-0.5" />

      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-foreground-accent mb-0.5">
          {replyTo.sender?.name || "Unknown User"}
        </p>

        {/* Handle content type */}
        {replyTo.messageType === "text" && (
          <p className="truncate text-foreground/90 text-xs">
            {truncateText(replyTo.content)}
          </p>
        )}

        {replyTo.messageType === "media" && (
          <div className="py-1">
            <MediaGridPreview items={(replyTo.mediaLinks || []).map((url) => ({ url }))} />
          </div>
        )}

        {replyTo.messageType === "note" && (
          <p className="text-foreground/80 italic text-xs">
            {truncateText(replyTo.content)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ReplyPreview;
