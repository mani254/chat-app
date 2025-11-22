"use client";

import { Search, X } from "lucide-react";
import { TextInput } from "../formComponents/TextInput";
import UsersList from "../users/UsersList";

interface Step2GroupMembersProps {
  search: string;
  setSearch: (s: string) => void;
  selectedMembers: any[];
  onToggleMember: (user: any) => void;
  onRemoveSelectedMember: (id: string) => void;
  selectedIds: string[];
  onNext?: () => void;
  onBack?: () => void;
}

const Step2GroupMembers = ({ search, setSearch, selectedMembers, onToggleMember, onRemoveSelectedMember, selectedIds, onNext, onBack }: Step2GroupMembersProps) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 pt-4">
        {selectedMembers.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {selectedMembers.map((u) => (
              <span key={u._id.toString()} className="px-2 py-1 rounded-2xl bg-background-accent inline-flex items-center gap-2 text-sm">
                {u.name}
                <button onClick={() => onRemoveSelectedMember(u._id.toString())} className="rounded-full hover:bg-muted/60">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative top-0 z-10 bg-background pb-2">
          <TextInput placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ minHeight: 38 }} inputClass="pl-8" />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-accent">
            <Search className="w-4 h-4" />
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <UsersList search={search} selectedUserIds={selectedIds} highlightSelected={true} onClick={onToggleMember} enabled={true} />
      </div>

    </div>
  );
};

export default Step2GroupMembers;