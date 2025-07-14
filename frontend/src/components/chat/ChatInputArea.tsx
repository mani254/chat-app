import { Button } from "@/components/ui/button";
import { Chat } from "@/src/types";
import EmojiPicker from "emoji-picker-react";
import { AnimatePresence, motion } from "framer-motion";
import { Paperclip, Send, Smile } from "lucide-react";
import { useRef, useState } from "react";

import { useSocketContext } from "../providers/socketProvider";

interface ChatInputAreaProps {
  activeChat: Chat;
}

const ChatInputArea = ({ activeChat }: ChatInputAreaProps) => {
  const [input, setInput] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { socket } = useSocketContext();



  function handleSendMessage() {
    if (!activeChat || !input.trim() || !socket) return;

    socket.emit("send-message", {
      chatId: activeChat._id,
      content: input,
      messageType: 'text',
    });
    console.log('send-message event emmited', input)
    setInput("");
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  function handleInputChange(value: string) {
    setInput(value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }

  function handleEmojiClick(emojiData: any) {
    setInput((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && activeChat) {
      console.log("File uploaded:", file.name);
    }
  }

  return (
    <div className="px-2 border-t bg-background absolute w-full bottom-0 right-0">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            placeholder="Type a message..."
            className="min-h-[44px] max-h-[120px] resize-none bg-background-accent/30 border-background-accent rounded-full w-full px-4 py-3 pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-8 h-8 p-0 hover:bg-background-accent">
              <Smile className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="w-8 h-8 p-0 hover:bg-background-accent">
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Button onClick={() => handleSendMessage()} disabled={!input.trim()} className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 right-4 z-50"
          >
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </motion.div>
        )}
      </AnimatePresence>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ChatInputArea;
