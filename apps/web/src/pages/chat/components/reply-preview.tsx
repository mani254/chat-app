import React from 'react';
import { X, Reply } from 'lucide-react';
import type { MessageResponse, MessageReplyResponse } from '@org/shared';

interface ReplyPreviewProps {
  reply: MessageResponse | MessageReplyResponse;
  onClear?: () => void;
  variant?: 'input' | 'bubble';
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({
  reply,
  onClear,
  variant = 'input',
}) => {
  const isInput = variant === 'input';

  return (
    <div
      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
        isInput
          ? 'bg-slate-100/90 border-slate-200 text-slate-800 shadow-sm backdrop-blur-md'
          : 'bg-slate-100/70 border-slate-200/60 text-slate-700'
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <Reply className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <div className="flex flex-col overflow-hidden">
          <span className="font-semibold text-indigo-700 truncate">
            {reply.sender?.name || 'User'}
          </span>
          <span className="truncate text-slate-600 text-[11px]">{reply.content}</span>
        </div>
      </div>

      {isInput && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
