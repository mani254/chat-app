import { MessageCircle } from "lucide-react";
import NewChatModal from "./newChatModel";

const NoChatsFound = ({ search }: { search: string }) => (
  <div className="flex flex-col items-center justify-center py-16 space-y-4 text-foreground-accent/50">
    <div className="bg-background-accent/50 p-4 rounded-full">
      <MessageCircle className="w-7 h-7 text-foreground-accent/50" />
    </div>
    <h2 className="text-lg font-semibold">No conversations yet</h2>
    <p className="text-sm text-center max-w-md">
      Looks like you haven’t started any chats. Tap the button below to get going.
    </p>
    {search && (
      <p className="text-xs">
        Try refining your search term
      </p>
    )}
    <div className="flex items-center justify-center">
      <NewChatModal />
    </div>
  </div>
);

export default NoChatsFound;
