import React, { useRef, useState } from 'react';
import { Send } from 'lucide-react';
import type { MessageResponse } from '@org/shared';
import { WS_EVENTS } from '@org/shared';
import { useSocket } from '@org/internal-sdk';
import { ReplyPreview } from './reply-preview';

interface MessageInputProps {
  chatId: string;
  onSend: (content: string, replyToId?: string) => Promise<void>;
  replyTo?: MessageResponse | null;
  onClearReply?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  chatId,
  onSend,
  replyTo,
  onClearReply,
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const { socket } = useSocket();

  const emitTypingStart = () => {
    if (!socket || isTypingRef.current) return;
    isTypingRef.current = true;
    socket.emit(WS_EVENTS.TYPING_START, { chatId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop();
    }, 2500);
  };

  const emitTypingStop = () => {
    if (!socket || !isTypingRef.current) return;
    isTypingRef.current = false;
    socket.emit(WS_EVENTS.TYPING_STOP, { chatId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    if (val.trim()) {
      emitTypingStart();
    } else {
      emitTypingStop();
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    emitTypingStop();
    setIsSubmitting(true);
    const textToSend = content.trim();
    setContent('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await onSend(textToSend, replyTo?._id);
      if (onClearReply) onClearReply();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative p-3 border-t border-slate-200/80 bg-white/80 backdrop-blur-md">
      {/* Reply Preview Header Banner */}
      {replyTo && (
        <div className="mb-2.5">
          <ReplyPreview reply={replyTo} onClear={onClearReply} variant="input" />
        </div>
      )}

      <div className="flex items-end gap-2 bg-slate-100/90 border border-slate-200/90 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 rounded-2xl p-2 transition-all shadow-inner">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Shift + Enter for newline)"
          rows={1}
          className="flex-1 max-h-[140px] resize-none bg-transparent px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none scrollbar-none"
        />

        <div className="flex items-center gap-1 shrink-0 pb-0.5">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white flex items-center justify-center transition-colors shadow-md shadow-indigo-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
