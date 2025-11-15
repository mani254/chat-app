import { useSearchUsers } from "@/hooks/useSearchUsers";
import { UserDocument } from "@workspace/database";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { useRef } from "react";
import AvatarDiv from "../common/AvatarDiv";
import LoadMoreLoader from "../loaders/LoadMoreLoader";


interface UserListProps {
  search: string;
  selectedUserIds?: string[];
  onClick?: (user: UserDocument) => void;
  highlightSelected?: boolean;
  enabled: boolean;
}

const UsersList = ({
  search,
  selectedUserIds = [],
  onClick,
  highlightSelected = false,
  enabled,
}: UserListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const { users, loadingUsers } = useSearchUsers(
    search,
    scrollRef as React.RefObject<HTMLDivElement>,
    observerRef as React.RefObject<HTMLDivElement>,
    enabled
  );

  return (
    <div className="h-full px-4 py-4 overflow-y-auto scrollbar-custom " ref={scrollRef}>
      {loadingUsers && users.length === 0 ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-2xl bg-background-accent" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-gray-400 text-center py-6 text-sm">No users found.</div>
      ) : (
        users.map((user) => {
          const isSelected = selectedUserIds.includes(user._id.toString());
          return (
            <button
              key={user._id.toString()}
              onClick={() => onClick?.(user)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 mb-2 rounded-2xl transition text-left cursor-pointer",
                highlightSelected && isSelected
                  ? "bg-background-accent"
                  : "hover:bg-background-accent/70"
              )}
            >
              <AvatarDiv user={user} />

              <div className="flex flex-col">
                <span className="text-sm font-medium mb-1">{user.name}</span>
                <span className="text-xs text-foreground-accent">{user.status}</span>
              </div>

              {!highlightSelected && user.isOnline && (
                <div className="ml-auto">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                </div>
              )}
            </button>
          );
        })
      )}

      <div ref={observerRef} className="h-8 flex justify-center items-center">
        {loadingUsers && users.length > 0 && <LoadMoreLoader />}
      </div>
    </div>
  );
};

export default UsersList;
