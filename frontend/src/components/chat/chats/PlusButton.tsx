"use client";

import { MessageSquare, Plus, Users } from "lucide-react";
import { useState } from "react";
import NewChatModal from "./NewChatModal";
import NewGroupModal from "./NewGroupModal";

const PlusButton = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [activeModal, setActiveModal] = useState<"chat" | "group" | null>(null);

  return (
    <>
      {/* Floating Action Button */}
      <div className="relative">
        <button
          aria-label="Create new chat or group"
          className="flex items-center justify-center w-11 h-11 rounded-full shadow border border-border bg-background/80 backdrop-blur transition cursor-pointer hover:bg-background-accent/60"
          onClick={() => setShowMenu((p) => !p)}
        >
          <Plus className="w-5 h-5 text-primary" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute bottom-full right-0 md:left-0 mb-2 w-48 bg-background border border-border rounded-2xl shadow-sm z-50 overflow-hidden">
              <button
                onClick={() => setActiveModal("chat")}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background-accent/70 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">New Chat</span>
              </button>

              <div className="h-px bg-border" />

              <button
                onClick={() => setActiveModal("group")}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background-accent/70 transition-colors"
              >
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">New Group</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Keep modals mounted — control via `open` */}
      <NewChatModal open={activeModal === "chat"} onOpenChange={(o) => !o && setActiveModal(null)} />
      <NewGroupModal open={activeModal === "group"} onOpenChange={(o) => !o && setActiveModal(null)} />
    </>
  );
};


export default PlusButton;
