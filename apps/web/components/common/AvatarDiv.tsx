import { UserDocument } from "@workspace/database";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import clsx from "clsx";
import { useUserStore } from "../../store/useUserStore";


interface AvatarDivProps {
  user?: UserDocument | null;
  showActiveDot?: boolean;
  showActiveCircle?: boolean;
  className?: string;
}

const AvatarDiv = ({
  user = null,
  showActiveDot = false,
  showActiveCircle = false,
  className = "",
}: AvatarDivProps) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const displayUser = user || currentUser;
  const isOnline = displayUser?.isOnline;

  // Fallback initials safely
  const initials = displayUser?.name
    ? displayUser.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "?";

  return (
    <div
      className={clsx(
        "relative inline-flex items-center justify-center rounded-full cursor-pointer transition-all",
        "bg-background border border-border shadow-sm hover:shadow-md",
        showActiveCircle && "ring-2 ring-primary/60 ring-offset-2 ring-offset-background",
        className || "p-[2px]"
      )}
    >
      <Avatar
        className={clsx(
          "overflow-hidden rounded-full transition-all duration-200",
          "hover:scale-[1.07] hover:shadow-[0_0_12px_hsl(var(--primary-color)/45%)]",
          className || "w-9 h-9"
        )}
      >
        <AvatarImage src={displayUser?.avatar || ""} className="object-cover" />
        <AvatarFallback className="bg-background-accent text-foreground-accent font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      {showActiveDot && isOnline && (
        <span className="absolute bottom-0 right-0 block w-3 h-3 rounded-full bg-green-500 border-[2px] border-background animate-pulse" />
      )}
    </div>
  );
};

export default AvatarDiv;
