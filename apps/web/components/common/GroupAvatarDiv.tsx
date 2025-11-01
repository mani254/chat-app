import { PopulatedChatDocument } from "@workspace/database";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";

interface GroupChatAvatarProps {
  chat: Pick<PopulatedChatDocument, "avatar" | "name">;
  className?: string;
}

const GroupAvatarDiv = ({ chat, className }: GroupChatAvatarProps) => {
  const initials = chat.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Avatar className={cn("w-10 h-10 rounded-lg border border-border bg-primary/10", className)}>
      <AvatarImage src={chat.avatar} />
      <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default GroupAvatarDiv;
