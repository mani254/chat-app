"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageSquare, Plus, Users } from "lucide-react";
import { useState } from "react";
import NewChatModal from "./NewChatModal";
import NewGroupModal from "./NewGroupModal";

const ChatActions = ({ triggerComp }: { triggerComp?: React.ReactNode }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  const defaultTrigger = (
    <button
      type="button"
      aria-label="Actions"
      className={`flex items-center justify-center w-10 h-10 rounded-full shadow-md border border-background-accent transition cursor-pointer text-background ${popoverOpen ? "text-background-accent" : ""
        }`}
    >
      <Plus className="w-5 h-5 text-primary" />
    </button>
  );

  return (
    <>
      {/* Controlled Popover: open/onOpenChange ensures click toggles and we can programmatically close it */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          {triggerComp ?? defaultTrigger}
        </PopoverTrigger>

        <PopoverContent
          side="left"       // place above the trigger
          align="start"      // align to the right edge (top-right)
          sideOffset={0}   // spacing from trigger
          className="flex flex-col gap-2 bg-background p-2 rounded-lg shadow-lg border border-foreground-accent/20 z-50"
        >
          <button
            type="button"
            onClick={() => {
              setChatOpen(true);    // open the modal
              setPopoverOpen(false); // close the popover
            }}
            className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-muted transition"
          >
            <MessageSquare className="w-4 h-4" /> New Chat
          </button>

          <button
            type="button"
            onClick={() => {
              setGroupOpen(true);
              setPopoverOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-muted transition"
          >
            <Users className="w-4 h-4" /> Create Group
          </button>
        </PopoverContent>
      </Popover>

      {/* Keep your modals controlled separately */}
      <NewChatModal open={chatOpen} onOpenChange={(v: boolean) => setChatOpen(v)} />
      <NewGroupModal open={groupOpen} onOpenChange={(v: boolean) => setGroupOpen(v)} />
    </>
  );
};

export default ChatActions;
