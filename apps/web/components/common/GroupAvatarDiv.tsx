import { PopulatedChatDocument } from "@workspace/database";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";

interface GroupAvatarDivProps {
  chat: Pick<PopulatedChatDocument, "avatar" | "name">;
  showActiveDot?: boolean;
  showActiveCircle?: boolean;
  className?: string;
}

const GroupAvatarDiv = ({
  chat,
  showActiveDot = false,
  showActiveCircle = false,
  className,
}: GroupAvatarDivProps) => {
  const displayChat = chat;


  const initials = displayChat?.name
    ? displayChat.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
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
        <AvatarImage src={displayChat?.avatar || ""} className="object-cover" />
        <AvatarFallback className="text-sm font-medium bg-muted text-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>

      {showActiveCircle && (
        <span className="absolute inset-0 rounded-full ring-2 ring-primary/50 ring-offset-2 ring-offset-background" />
      )}

      {showActiveDot && (
        <span className="absolute bottom-0 right-0 w-[10px] h-[10px] rounded-full bg-green-400 ring-2 ring-background" />
      )}
    </div>
  );
};

export default GroupAvatarDiv;
