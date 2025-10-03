"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/src/store/useChatStore";
import { useUserStore } from "@/src/store/useUserStore";
import { User } from "@/src/types";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ResponsiveModal } from "../../ui/ResponsiveModal";
import UserList from "../users/UsersList";

const NewChatModal = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const createChat = useChatStore((state) => state.createChat);
  const currentUser = useUserStore((state) => state.currentUser);

  const handleCreateChat = useCallback(
    async (user: User) => {
      const info = {
        users: [currentUser!._id, user._id],
        isGroupChat: false,
        name: "",
        groupAdmin: undefined,
      };
      const res = await createChat(info);
      setOpen(false);
      router.push(`/?chatId=${res._id}`);
    },
    [createChat, currentUser, router]
  );

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      title="Start a new chat"
      trigger={
        <button
          aria-label="New Chat"
          className="flex items-center justify-center w-11 h-11 rounded-full shadow border border-border bg-background/80 backdrop-blur transition cursor-pointer hover:bg-background-accent/60"
        >
          <Plus className="w-5 h-5 text-primary" />
        </button>
      }
    >
      <div className="h-[90vh] md:h-96">
        {/* Search Bar */}
        <div className="relative mx-5">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2 rounded-2xl border border-border bg-background placeholder:text-foreground-accent/70 text-sm"
            )}
            style={{ minHeight: 38 }}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
        </div>

        {/* User List */}
        <UserList search={search} enabled={open} onClick={handleCreateChat} />
      </div>
    </ResponsiveModal>
  );
};

export default NewChatModal;
