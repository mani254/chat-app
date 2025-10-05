"use client";

import { Button } from "@/components/ui/button";
import { Copy, Reply, Share2, Smile } from "lucide-react";
import { useState } from "react";
import FeatureComingSoonModal from "../../ui/FeatureCommingSoonModal";

interface MessageActionsProps {
  onCopy: () => void;
  onReply: () => void;
  onForward: () => void;
  onReact: () => void;
}

const MessageActions = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCopy,
  onReply,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onForward,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onReact,
}: MessageActionsProps) => {
  const [openFeatureCommingSoonModal, setOpenFeatureCommingSoonModal] = useState(false)
  return (
    <div className="flex flex-col p-2 w-40 bg-background">
      <Button
        variant="ghost"
        size="sm"
        className="justify-start"
        onClick={() => setOpenFeatureCommingSoonModal(true)}
      >
        <Copy className="w-4 h-4 mr-2" /> Copy
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="justify-start"
        onClick={() => setOpenFeatureCommingSoonModal(true)}
      >
        <Share2 className="w-4 h-4 mr-2" /> Forward
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="justify-start"
        onClick={onReply}
      >
        <Reply className="w-4 h-4 mr-2" /> Reply
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="justify-start"
        onClick={() => setOpenFeatureCommingSoonModal(true)}
      >
        <Smile className="w-4 h-4 mr-2" /> React
      </Button>
      <FeatureComingSoonModal open={openFeatureCommingSoonModal} onOpenChange={setOpenFeatureCommingSoonModal} />
    </div>
  );
};

export default MessageActions;
