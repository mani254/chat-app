import { useChatStore } from "@/store/useChatStore";
import { useReplyStore } from "@/store/useReplyStore";
import { useUserStore } from "@/store/useUserStore";
import { SocketRes } from "@workspace/database";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";
import EmojiPicker from "emoji-picker-react";
import { AnimatePresence, motion } from "framer-motion";
import { Paperclip, Send, Smile } from "lucide-react";
import { useRef, useState } from "react";
import { useSocketContext } from "../providers/SocketProviders";
import ReplyComponent from "./ReplyComponent";


const MessageInputArea = () => {

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTyping = useRef(false);

  const [input, setInput] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [files, setFiles] = useState<undefined | File[]>();
  const [sending, setSending] = useState(false);


  const { socket } = useSocketContext();
  const currentUser = useUserStore((s) => s.currentUser);
  const activeChat = useChatStore((s) => s.activeChat)
  const { replyTo, clearReplyTo } = useReplyStore();


  const emitEndTyping = () => {
    if (isTyping.current && socket && activeChat) {
      isTyping.current = false;
      socket.emit("user-end-typing", {
        chatId: activeChat._id,
        user: {
          _id: currentUser?._id,
          name: currentUser?.name,
        },
      });
    }
  };

  const emitStartTyping = () => {
    if (!isTyping.current && socket && activeChat) {
      isTyping.current = true;
      socket.emit("user-start-typing", {
        chatId: activeChat._id,
        user: {
          _id: currentUser?._id,
          name: currentUser?.name,
        },
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      emitEndTyping();
    }, 2000);
  };

  function handleEmojiClick(emojiData: any) {
    setInput((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  function handleInputChange(value: string) {
    emitStartTyping();
    setInput(value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }

  function handleFileChange() {
    // function  to handle the files change
  }

  async function handleSendMessage() {

    if (!activeChat || !input.trim() || !socket || sending) return;

    setSending(true);

    let mediaLinks: string[] = [];

    const isMedia = mediaLinks.length > 0;
    const payload = {
      chatId: activeChat._id,
      content: input,
      messageType: (isMedia ? 'media' : 'text'),
      replyTo: replyTo?._id,
      mediaLinks: isMedia ? mediaLinks : undefined,
    };

    try {
      await new Promise<void>((resolve) => {
        socket.emit("send-message", payload, (res: SocketRes) => {
          if (res?.ok) {
            resolve();
          } else {
            const msg = res?.error?.message || "Failed to send message";
            toast.error("sending failed", {
              description: res?.error?.code + "-" + msg
            })
            resolve();
          }
        });
      });
    } finally {
      setSending(false);
    }

    setInput("");
    setShowEmojiPicker(false);
    clearReplyTo();
    setFiles(undefined);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  return (
    <div className="px-3 md:px-4 border-t border-border bg-background">
      <div className="flex items-center gap-2 py-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={1}
            placeholder="Type a message..."
            className="min-h-11 max-h-[120px] resize-none w-full px-4 py-3 pr-20 rounded-2xl bg-background border border-border placeholder:text-foreground-accent/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-8 h-8 p-0 hover:bg-background-accent rounded-full">
              <Smile className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="w-8 h-8 p-0 hover:bg-background-accent rounded-full">
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>
          {replyTo && (
            <div className="absolute w-full bottom-full mb-2">
              <ReplyComponent
                reply={replyTo}
                variant="input"
                onClose={clearReplyTo}
              />
            </div>
          )}
        </div>
        <Button onClick={() => handleSendMessage()} disabled={(!input.trim() && (!files || files.length === 0)) || sending} className="w-11 h-11 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50">
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-24 right-4 drop-shadow-lg"
          >
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </motion.div>
        )}
      </AnimatePresence>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar,.7z,.tar,.gz,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.html,.css,.scss,.sass,.less,.json,.xml,.yaml,.yml"
        onChange={handleFileChange}
        multiple={true}
      />
    </div>
  )
}

export default MessageInputArea
