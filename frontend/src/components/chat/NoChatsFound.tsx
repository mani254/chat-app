import { MessageCircle } from "lucide-react";
import NewChatModal from "./AddChatModal";

interface NoChatsFoundProps {
  search: string;
}

const NoChatsFound = ({ search }: NoChatsFoundProps) => {
  const showSearchHint = Boolean(search?.trim());

  return (
    <section className="flex flex-col items-center justify-center px-4 py-16 space-y-4 text-foreground-accent">
      <div className="p-4 rounded-full bg-background-accent">
        <MessageCircle className="w-7 h-7 text-foreground-accent/70" aria-hidden="true" />
      </div>

      <h2 className="text-lg font-semibold">No conversations yet</h2>

      <p className="text-sm text-center max-w-md">
        Looks like you haven’t started any chats. Tap the button below to get going.
      </p>

      {showSearchHint && (
        <p className="text-xs text-center text-muted-foreground">
          Try refining your search term
        </p>
      )}

      <div className="flex items-center justify-center">
        <NewChatModal />
      </div>
    </section>
  );
};

export default NoChatsFound;
