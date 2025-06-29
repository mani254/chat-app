import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "../store/useUserStore";
import { User } from "../types";

const AvatarDiv = ({
  user = null,
  variant = "normal",
}: {
  user?: User | null;
  variant?: "activeUsersList" | "normal";
}) => {
  let currentUser = useUserStore((state) => state.currentUser);

  if (user) {
    currentUser = user;
  }

  const isActiveUsersList = variant === "activeUsersList";
  const isOnline = currentUser?.isOnline

  return (
    <div className={isActiveUsersList ? "relative inline-block" : "relative"}>
      <Avatar
        className={
          isActiveUsersList
            ? "w-12 h-12 p-1 border-2 border-green-400"
            : "w-8 h-8 bg-primary-accent"
        }
      >
        <AvatarImage src={currentUser?.avatar} />
        <AvatarFallback>
          {currentUser?.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {(isActiveUsersList || isOnline) && (
        <span
          className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
          style={{ boxShadow: "0 0 0 2px #22c55e" }}
        />
      )}
    </div>
  );
};

export default AvatarDiv;