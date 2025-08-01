import { useChatStore } from "@/src/store/useChatStore";
import { useMessageStore } from "@/src/store/useMessageStore";
import { useEffect, useRef, useState } from "react";

const TypingDots = () => {
  const typingInfo = useMessageStore((s) => s.typingInfo);
  const activeChat = useChatStore((s) => s.activeChat);
  const typingSoundRef = useRef<HTMLAudioElement>(null);
  const [canPlaySound, setCanPlaySound] = useState(false);

  // Only set after a real user interaction
  useEffect(() => {
    const handleInteraction = () => {
      setCanPlaySound(true);
      window.removeEventListener("click", handleInteraction);
    };
    window.addEventListener("click", handleInteraction);
    return () => window.removeEventListener("click", handleInteraction);
  }, []);

  useEffect(() => {
    if (typingInfo?.isTyping && canPlaySound && typingSoundRef.current) {
      typingSoundRef.current.currentTime = 0;
      typingSoundRef.current.play().catch((err) => {
        console.warn("Typing sound play failed:", err);
      });
    }
  }, [typingInfo?.isTyping, canPlaySound]);

  if (!typingInfo?.isTyping || !activeChat) return null;

  return (
    <div className="flex gap-3 items-center">
      {/* Hidden audio */}
      <audio
        ref={typingSoundRef}
        src="../../assets/sounds/typing-effect.mp3"
        className="hidden"
        loop
      />
      {/* Bouncing Dots */}
      <div className="flex space-x-1 px-3 py-1 bg-gray-100 rounded-full">
        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0s]" />
        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.1s]" />
        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
      </div>
      {activeChat.isGroupChat && <span>{typingInfo?.typingUser?.name}</span>}
    </div>
  );
};

export default TypingDots;
