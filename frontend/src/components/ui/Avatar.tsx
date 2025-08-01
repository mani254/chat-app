import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import clsx from "clsx";
import { useUserStore } from "../../store/useUserStore";
import { User } from "../../types";

interface AvatarDivProps {
  user?: User | null;
  showActiveDot?: boolean;
  showActiveCircle?: boolean;
  className?: string;
}

const AvatarDiv = ({
  user = null,
  showActiveDot = false,
  showActiveCircle = false,
  className = "", // default empty string
}: AvatarDivProps) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const displayUser = user || currentUser;
  const isOnline = displayUser?.isOnline;

  return (
    <div
      className={clsx(
        "relative inline-block rounded-full cursor-pointer",
        showActiveCircle
          ? "p-[3px] border border-green-400"
          : "border bg-background border-foreground-accent/50 p-1"
      )}
    >
      <Avatar
        className={clsx(
          "transition-all aspect-square",
          showActiveCircle && "ring-2 ring-background",
          className || "w-8 h-8" // ✅ use className if provided, fallback to default
        )}
      >
        <AvatarImage src={displayUser?.avatar} />
        <AvatarFallback>
          {displayUser?.name?.charAt(0)?.toUpperCase()}
          {displayUser?.name?.charAt(1)?.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {showActiveDot && isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border border-background rounded-full ring-2 ring-background" />
      )}
    </div>
  );
};

export default AvatarDiv;
