import { MessageCircle } from "lucide-react";

const NoActiveChatScreen = () => {
  return (
    <div className="flex flex-1 flex-col h-full items-center justify-center text-center px-6 bg-background-accent/20">
      <div className="p-4 rounded-full bg-background-accent">
        <MessageCircle size={28} className="text-foreground-accent/70" />
      </div>

      <h1 className="mt-4 text-lg font-semibold text-foreground">
        Welcome to Messages
      </h1>

      <p className="mt-1 text-sm text-muted-foreground max-w-xs">
        Select a chat or group from the sidebar to start messaging.
      </p>
    </div>
  );
};

export default NoActiveChatScreen;