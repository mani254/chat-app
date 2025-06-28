import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/src/store/useChatStore";
import { useUIStore } from "@/src/store/useUiStore";
import { useUserStore } from "@/src/store/useUserStore";
import { Chat } from "@/src/types";
import EmojiPicker from 'emoji-picker-react';
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, MoreVertical, Paperclip, Phone, Send, Smile, Video } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from "react";


const ChatWindow = () => {
  const searchParams = useSearchParams();

  const [activeChat, setActiveChat] = useState<Chat>();
  const [messageInput, setMessageInput] = useState<string>("");
  const [isUserTyping, setIsUserTyping] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const { chats, sendMessage, messages } = useChatStore();
  const { users, currentUser } = useUserStore();
  const { toggleSidebar } = useUIStore();
  const { isDarkMode } = useUIStore();

  const chatMessages = activeChat ? messages[activeChat?._id] || [] : [];


  useEffect(() => {
    const chatId = searchParams.get('chatId');
    const chat = chats.find(c => c._id === chatId);
    if (chat) {
      setActiveChat(chat);
    } else {
      setActiveChat(chat);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const getChatAvatar = (chat: Chat) => {
    if (chat.isGroupChat) {
      return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=40&h=40&fit=crop&crop=face';
    }
    const otherUser = users.find(u =>
      chat.users.includes(u._id) && u._id !== currentUser?._id
    );
    return otherUser?.avatar;
  };

  const getChatName = (chat: Chat) => {
    if (chat.isGroupChat) {
      return chat.name || 'Group Chat';
    }
    const otherUser = users.find(u =>
      chat.users.includes(u._id) && u._id !== currentUser?._id
    );
    return otherUser?.name || 'Unknown User';
  };

  const getOnlineStatus = (chat: Chat) => {
    if (!chat || chat.isGroupChat) return null;
    const otherUser = users.find(u =>
      chat.users.includes(u._id) && u._id !== currentUser?._id
    );
    return otherUser?.isOnline ? 'Active now' : 'Last seen recently';
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeChat) return;

    sendMessage(activeChat._id, messageInput.trim());
    setMessageInput('');
    setShowEmojiPicker(false);
    setIsUserTyping(false);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (value: string) => {
    setMessageInput(value);
    if (!isUserTyping && value.trim()) {
      setIsUserTyping(true);
    }

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessageInput(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-24 h-24 bg-primary-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Welcome to Messenger
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            Select a conversation from the sidebar to start chatting with your friends and colleagues.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col bg-background relative">
      {/* Header */}
      <div className="p-4 border-b border-background-accent bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <Avatar className="w-10 h-10">
              <AvatarImage src={getChatAvatar(activeChat)} />
              <AvatarFallback>
                {getChatName(activeChat).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="font-semibold">
                {getChatName(activeChat)}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getOnlineStatus(activeChat) || `${activeChat.users.length} members`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {chatMessages.map((message, index) => {
            const sender = users.find(u => u._id === message.sender);
            const isOwn = message.sender === currentUser?._id;
            const showAvatar = !isOwn && (
              index === 0 ||
              chatMessages[index - 1].sender !== message.sender ||
              new Date(message.createdAt).getTime() - new Date(chatMessages[index - 1].createdAt).getTime() > 300000
            );
            const showName = activeChat.isGroupChat && !isOwn && showAvatar;

            return (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-2",
                  isOwn ? "justify-end" : "justify-start"
                )}
              >
                {!isOwn && (
                  <div className="w-8">
                    {showAvatar && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={sender?.avatar} />
                        <AvatarFallback className="text-xs">
                          {sender?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}

                <div className={cn(
                  "max-w-xs lg:max-w-md",
                  isOwn ? "text-right" : "text-left"
                )}>
                  {showName && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-3">
                      {sender?.name}
                    </p>
                  )}

                  <div className={cn(
                    "inline-block px-4 py-2 rounded-2xl max-w-full break-words",
                    isOwn
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-background rounded-bl-md"
                  )}>
                    {message.messageType === 'text' && (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                    {message.messageType === 'image' && (
                      <div>
                        <Image
                          src={message.content}
                          alt="Shared image"
                          className="rounded-lg max-w-full h-auto"
                          width={300}
                          height={300}
                        />
                      </div>
                    )}
                    {message.messageType === 'file' && (
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm">{message.content}</span>
                      </div>
                    )}
                  </div>

                  <div className={cn(
                    "flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400",
                    isOwn ? "justify-end" : "justify-start"
                  )}>
                    <span>{formatMessageTime(message.createdAt)}</span>
                    {isOwn && (
                      <span className="text-blue-600 dark:text-blue-400">
                        {message.readBy.length > 1 ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-background-accent bg-background">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[44px] max-h-[120px] resize-none bg-background-accent/30 border-background-accent rounded-full w-full px-4 py-3 pr-20"
              rows={1}
            />

            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-8 h-8 p-0 hover:bg-background-accent"
              >
                <Smile className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 p-0 hover:bg-background-accent"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-20 right-4 z-50"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={isDarkMode ? 'dark' : 'light' as any}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && activeChat) {
              // Mock file upload
              const fileName = file.name;
              sendMessage(activeChat._id, fileName, 'file');
            }
          }}
        />
      </div>
    </div>
  )
}
export default ChatWindow