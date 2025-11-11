"use client";

import { MessageWithSender } from "@workspace/database";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { RenderMessageContent } from "./RenderMessageContent";

interface ReplyComponentProps {
  reply: MessageWithSender;
  onClose?: () => void; // optional — only for input mode
  variant?: "view" | "input"; // view = static, input = active reply
  className?: string;
}

const ReplyComponent = ({ reply, onClose, variant = "view", className }: ReplyComponentProps) => {
  const isInputVariant = variant === "input";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "flex items-start gap-2 border border-border rounded-lg relative overflow-hidden",
        isInputVariant
          ? "bg-background w-full px-3 py-2 shadow-sm"
          : "bg-black/10 px-2 py-2",
        className
      )}
    >
      {/* Left colored indicator */}
      <div
        className={cn(
          "w-1 rounded-full",
          isInputVariant ? "bg-primary/80 h-12" : "bg-primary/60 h-10"
        )}
      />

      {/* Reply content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <span className="text-xs font-medium text-muted-foreground truncate">
          {reply.sender?.name || "Unknown User"}
        </span>
        <div className="max-w-full overflow-hidden">
          <RenderMessageContent message={reply} showMeta={false} />
        </div>
      </div>

      {/* Close icon (only for input variant) */}
      {isInputVariant && onClose && (
        <button
          onClick={onClose}
          className="absolute top-1.5 right-1.5 p-1.5 rounded-full hover:bg-background-accent transition"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </motion.div>
  );
};

export default ReplyComponent;
