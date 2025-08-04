"use client";

import clsx from "clsx";
import { Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useChatStore } from "@/src/store/useChatStore";
import { useUserStore } from "@/src/store/useUserStore";
import { User } from "@/src/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveModal } from "../../ui/ResponsiveModal";
import UserList from "../users/UsersList";


const NewGroupModal = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const selectedUserIds = useMemo(() => selectedUsers.map((u) => u._id), [selectedUsers])

  const currentUser = useUserStore((state) => state.currentUser);
  const loadingUsers = useUserStore((state) => state.loadingUsers);
  const createChat = useChatStore((state) => state.createChat);

  const handleToggleUser = (user: User) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    const payload = {
      name: groupName,
      users: [currentUser!._id, ...selectedUsers.map((u) => u._id)],
      isGroupChat: true,
      groupAdmin: currentUser!._id,
    };

    const chat = await createChat(payload);
    if (chat) {
      setOpen(false);
      setGroupName("");
      setSelectedUsers([]);
      router.push(`/?chatId=${chat._id}`);
    }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      title="Create a group"
      trigger={
        <button
          aria-label="New Group"
          className="flex items-center justify-center w-10 h-10 rounded-full shadow-md border border-background-accent transition cursor-pointer text-background hover:text-background-accent"
        >
          <Plus className="w-5 h-5 text-primary" />
        </button>
      }
    >
      <div className="h-[90vh] md:h-auto min-h-80 md:max-h-96">
        {/* Group Name Input */}
        <div className="px-5">
          <Input
            placeholder="Group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="text-sm rounded-2xl border border-foreground-accent/50"
          />
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 px-5">
            {selectedUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-1 px-2 py-1 bg-muted text-sm rounded-full"
              >
                <span>{user.name}</span>
                <X
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => handleToggleUser(user)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Search Users */}
        <div className="relative mx-5">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={clsx(
              "w-full pl-10 pr-4 py-2 rounded-2xl border border-foreground-accent/50 text-sm",
              loadingUsers && "pr-10"
            )}
            style={{ minHeight: 38 }}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className={clsx("w-4 h-4", loadingUsers && "animate-spin")} />
          </span>
        </div>

        {/* User List */}
        <UserList
          search={search}
          enabled={open}
          selectedUserIds={selectedUserIds}
          onClick={handleToggleUser}
          highlightSelected
        />

        {/* Create Button */}
        <div className="px-5 pb-2">
          <Button
            disabled={!groupName || selectedUsers.length === 0}
            onClick={handleCreateGroup}
            className="w-full rounded-xl"
          >
            Create Group
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default NewGroupModal;
