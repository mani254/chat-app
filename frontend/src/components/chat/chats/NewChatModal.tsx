"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/src/store/useChatStore";
import { useUserStore } from "@/src/store/useUserStore";
import { User } from "@/src/types";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ResponsiveModal } from "../../ui/ResponsiveModal";
import UserList from "../users/UsersList";

interface NewChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewChatModal = ({ open, onOpenChange }: NewChatModalProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const createChat = useChatStore((s) => s.createChat);
  const currentUser = useUserStore((s) => s.currentUser);

  const handleCreateChat = async (user: User) => {
    const info = {
      users: [currentUser!._id, user._id],
      isGroupChat: false,
      name: "",
      groupAdmin: undefined,
    };
    const res = await createChat(info);
    onOpenChange(false); // closes
    router.push(`/?chatId=${res._id}`);
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Start a new chat"
    >
      <div className="h-[80vh] md:h-[500px]">
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
        <UserList search={search} enabled={true} onClick={handleCreateChat} />
      </div>
    </ResponsiveModal>
  );
};

export default NewChatModal;
