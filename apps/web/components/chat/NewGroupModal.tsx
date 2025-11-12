"use client";

import { useUserStore } from "@/store/useUserStore";
import { UserDocument } from "@workspace/database";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ResponsiveModal } from "../common/ResponsiveModal";
import { TextInput } from "../formComponents/TextInput";
import UsersList from "../users/UsersList";

interface NewGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewGroupModal = ({ open, onOpenChange }: NewGroupModalProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<UserDocument[]>([]);

  const currentUser = useUserStore((s) => s.currentUser);

  const handleCreateGroup = async () => {
    const info = {
      users: selectedMembers.map(user => user._id.toString()),
      name: groupName,
      createdBy: currentUser!._id.toString(),
      isGroupChat: true, // Required property
    };

    // const res = await createGroup(info);
    // if (res && res._id) { // Combining existence and type check
    //   router.push(`/?chatId=${res._id}`); // Redirect to new group chat
    // } else {
    //   console.error('Group creation failed: no valid response received');
    // }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create a new group"
    >
      <div className="h-[80vh] md:h-[500px]">
        <TextInput
          placeholder="Group name..."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          style={{ minHeight: 38 }}
        />

        <div className="relative mx-5 mt-4">
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

        <UsersList
          search={search}
          onClick={user => setSelectedMembers(prev => [...prev, user])}
          enabled={true}
        />
        <button onClick={handleCreateGroup} className="mt-4 btn-primary">Create Group</button>
      </div>
    </ResponsiveModal>
  );
};

export default NewGroupModal;