
import { useChatStore } from "@/store/useChatStore";
import { useMessageStore } from "@/store/useMessageStore";

const TypingDots = () => {
  const typingInfo = useMessageStore((s) => s.typingInfo);
  const activeChat = useChatStore((s) => s.activeChat);


  if (!typingInfo?.isTyping || !activeChat) return null;

  return (
    <div className="flex flex-col gap-[2px] items-start mt-2">

      {/* Bouncing Dots */}
      <div className="flex space-x-1 px-3 py-1 rounded-full bg-background-accent">
        <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:0s] bg-foreground-accent" />
        <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:0.1s] bg-foreground-accent" />
        <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:0.2s] bg-foreground-accent" />
      </div>
      {activeChat.isGroupChat && <span className="text-[10px] ml-2">{typingInfo?.typingUser?.name}</span>}

    </div>
  );
};

export default TypingDots;
