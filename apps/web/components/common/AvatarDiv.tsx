import { UserDocument } from "@workspace/database";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";
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
  className,
}: AvatarDivProps) => {
  const currentUser = useUserStore((s) => s.currentUser);
  const displayUser = user || currentUser;
  const isOnline = displayUser?.isOnline;

  const initials = displayUser?.name
    ? displayUser.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="relative">
      <Avatar
        className={cn(
          "w-10 h-10 rounded-full transition-transform duration-150 border border-border bg-primary/10",
          "hover:scale-105 active:scale-95",
          className
        )}
      >
        <AvatarImage src={displayUser?.avatar || ""} className="object-cover" />
        <AvatarFallback className="text-sm font-medium bg-muted text-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>

      {showActiveCircle && isOnline && (
        <span className="absolute inset-0 rounded-full ring-2 ring-primary/50 ring-offset-2 ring-offset-background" />
      )}

      {showActiveDot && isOnline && (
        <span className="absolute bottom-[0px] right-[0px] w-[10px] h-[10px] rounded-full bg-green-400 ring-[2px] ring-background" />
      )}
    </div>
  );
};

export default AvatarDiv;
