import { MessageCircle } from "lucide-react";

interface NoChatsFoundProps {
  search: string;
}

const NoChatsFound = ({ search }: NoChatsFoundProps) => {
  const showSearchHint = Boolean(search?.trim());

  return (
    <section className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground select-none">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
        <MessageCircle className="w-6 h-6 text-muted-foreground" />
      </div>

      <h2 className="mt-4 text-base font-medium text-foreground">No conversations yet</h2>

      <p className="text-sm max-w-xs">
        Start chatting to see your conversations here.
      </p>

      {showSearchHint && (
        <p className="text-xs text-muted-foreground mt-1">
          Try adjusting your search keywords.
        </p>
      )}
    </section>
  );
};

export default NoChatsFound;
