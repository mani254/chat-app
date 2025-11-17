"use client";

import { useChatStore } from "@/store/useChatStore";
import { useUserStore } from "@/store/useUserStore";
import { UserDocument } from "@workspace/database";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ResponsiveModal } from "../common/ResponsiveModal";
import { TextInput } from "../formComponents/TextInput";
import UsersList from "../users/UsersList";


interface NewChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewChatModal = ({ open, onOpenChange }: NewChatModalProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const createChat = useChatStore((s) => s.createChat);
  const currentUser = useUserStore((s) => s.currentUser);

  const handleCreateChat = async (user: UserDocument) => {
    const info = {
      users: [currentUser!._id.toString(), user._id.toString()],
      isGroupChat: false,
      name: "",
      groupAdmin: undefined,
    };
    const res = await createChat(info);
    onOpenChange(false); // closes
    router.push(`/chat/${res._id}`);
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
          <TextInput
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minHeight: 38 }}
            inputClass="pl-8"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
        </div>

        {/* User List */}
        <UsersList search={search} enabled={true} onClick={handleCreateChat} />
      </div>
    </ResponsiveModal>
  );
};

export default NewChatModal;
