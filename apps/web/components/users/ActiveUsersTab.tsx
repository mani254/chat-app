import { useUserStore } from "@/store/useUserStore";
import { useMemo } from "react";
import AvatarDiv from "../common/AvatarDiv";

const ActiveUsersTab = ({ search }: { search?: string }) => {

  const activeUsers = useUserStore((s) => s.activeUsers);

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return activeUsers;
    return activeUsers.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [activeUsers, search]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden px-2 py-2 space-y-1">
      {filtered.length === 0 ? (
        <div className="text-xs text-foreground-accent px-2 py-2">No active users</div>
      ) : (
        filtered.map((user) => (
          <div key={user._id.toString()} className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-background-accent/70 transition">
            <AvatarDiv user={user} showActiveDot />
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-1">{user.name}</span>
              <span className="text-xs text-foreground-accent">{user.status}</span>
            </div>
            <div className="ml-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ActiveUsersTab;