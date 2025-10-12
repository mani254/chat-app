import { Button } from "@/components/ui/button";
import { useMediaUpload } from "@/src/hooks/useMediaUpload";
import api from "@/src/lib/api";
import { useReplyStore } from "@/src/store/useReplyStore";
import { useUserStore } from "@/src/store/useUserStore";
import { Chat, MessageWithoutChat, SocketRes } from "@/src/types";
import EmojiPicker from "emoji-picker-react";
import { AnimatePresence, motion } from "framer-motion";
import { Paperclip, Send, Smile } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useSocketContext } from "../../providers/socketProvider";
import FilePreviewList from "./FilePreviewList";
import { MediaUploadProgressList, MediaUploadSummary } from "./MediaUploadProgress";
import ReplyPreview from "./ReplyToPreview";

interface ChatInputAreaProps {
  activeChat: Chat;
  setSendingMedia: (value: boolean) => void;
}

const MessageInputArea = ({ activeChat, setSendingMedia }: ChatInputAreaProps) => {
  const [input, setInput] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [files, setFiles] = useState<undefined | File[]>();
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { socket } = useSocketContext();
  const currentUser = useUserStore((s) => s.currentUser);
  const { replyTo, clearReplyTo } = useReplyStore();

  const {
    uploadState,
    initializeUploads,
    updateUploadProgress,
    completeUpload,
    failUpload,
    retryUpload,
    clearUploads,
  } = useMediaUpload();

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTyping = useRef(false);

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

  // cleanup typing timeout on unmount/chat switch
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      emitEndTyping();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat?._id]);

  async function handleSendMessage() {
    if (!activeChat || !input.trim() || !socket || sending) return;

    setSending(true);

    let mediaLinks: string[] = [];
    if (files && files.length > 0) {
      setSendingMedia(true);

      // Initialize upload tracking
      const uploads = initializeUploads(files);

      try {
        const uploadPromises = uploads.map(async (upload) => {
          try {
            // Simulate progress updates
            const progressInterval = setInterval(() => {
              const randomProgress = Math.min(upload.progress + Math.random() * 20, 90);
              updateUploadProgress(upload.fileId, randomProgress);
            }, 200);

            const form = new FormData();
            form.append("file", upload.file);
            form.append('chatId', activeChat._id);

            const { data } = await api.post(`/api/messages/upload`, form, {
              headers: { "Content-Type": "multipart/form-data" },
            });

            clearInterval(progressInterval);
            completeUpload(upload.fileId, data.url, data.mimeType, data.size);
            return data.url as string;
          } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Upload failed";
            failUpload(upload.fileId, errorMessage);
            throw err;
          }
        });

        mediaLinks = await Promise.all(uploadPromises);

        // Clear any failed uploads that weren't retried
        const failedUploads = uploadState.uploads.filter(upload => upload.status === 'failed');
        if (failedUploads.length > 0) {
          toast.error(`${failedUploads.length} file(s) failed to upload`, {
            description: "You can retry failed uploads or send without them.",
          });
        }

      } catch (err: any) {
        toast.error("Upload failed", {
          description: err?.response?.data?.message || err?.message || "Something went wrong while uploading.",
        });
        setSending(false);
        return;
      } finally {
        setSendingMedia(false);
      }
    }

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
    clearUploads();
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
    emitStartTyping();
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
    const fileList = e.target.files;
    if (fileList && activeChat) {
      setFiles(Array.from(fileList));
    }
  }

  const handleRemove = useCallback((index: number) => {
    setFiles((prev) => prev?.filter((_, i) => i !== index));
  }, []);

  // Memoize file preview to prevent flickering
  const filePreview = useMemo(() => {
    if (!files || files.length === 0 || uploadState.isUploading) return null;
    return <FilePreviewList onRemove={handleRemove} files={files} />;
  }, [files, uploadState.isUploading, handleRemove]);

  // Memoize upload progress to prevent flickering
  const uploadProgress = useMemo(() => {
    if (!uploadState.isUploading) return null;
    return (
      <div className="bg-background-accent/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
        <MediaUploadSummary
          totalFiles={uploadState.uploads.length}
          completedCount={uploadState.completedCount}
          failedCount={uploadState.failedCount}
          totalProgress={uploadState.totalProgress}
          isUploading={uploadState.isUploading}
        />
        <MediaUploadProgressList
          uploads={uploadState.uploads}
          onRetry={retryUpload}
          className="mt-2"
        />
      </div>
    );
  }, [uploadState, retryUpload]);

  return (
    <div className="px-3 md:px-4 border-t border-border bg-background absolute w-full bottom-0 right-0 z-[50]">
      <div className="flex items-center gap-2 py-2">
        <div className="flex-1 relative">
          {/* Upload Progress */}
          {uploadProgress && (
            <div className="absolute w-full bottom-[105%] mb-2">
              {uploadProgress}
            </div>
          )}

          {/* File Preview */}
          {filePreview && (
            <div className="flex absolute w-full bottom-[105%]">
              {filePreview}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            placeholder="Type a message..."
            className="min-h-[44px] max-h-[120px] resize-none w-full px-4 py-3 pr-20 rounded-2xl bg-background border border-border placeholder:text-foreground-accent/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-8 h-8 p-0 hover:bg-background-accent rounded-full">
              <Smile className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="w-8 h-8 p-0 hover:bg-background-accent rounded-full">
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>
          {replyTo && <div className="absolute w-full bottom-[100%]">
            <ReplyPreview replyTo={replyTo as MessageWithoutChat} onCancel={clearReplyTo} view={false} />
          </div>}
        </div>
        <Button onClick={() => handleSendMessage()} disabled={(!input.trim() && (!files || files.length === 0)) || sending || uploadState.isUploading} className="w-11 h-11 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50">
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
  );
};

export default MessageInputArea;
