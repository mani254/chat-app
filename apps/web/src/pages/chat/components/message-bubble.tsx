import React, { useState } from 'react';
import { Check, CheckCheck, Copy, Reply, Trash2 } from 'lucide-react';
import type { MessageResponse, UserSummary } from '@org/shared';
import { ReplyPreview } from './reply-preview';

interface MessageBubbleProps {
  message: MessageResponse;
  currentUser: UserSummary | null;
  onReply?: (msg: MessageResponse) => void;
  onDelete?: (msgId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUser,
  onReply,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const isSelf = currentUser?._id === message.sender?._id;
  const isRead = message.readBy?.length > 1;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group relative flex gap-2.5 max-w-[85%] sm:max-w-[75%] my-1.5 ${
        isSelf ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'
      }`}
    >
      {/* Avatar for receiver side */}
      {!isSelf && (
        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-700 shrink-0 self-end mb-1 shadow-sm">
          {message.sender?.avatar ? (
            <img
              src={message.sender.avatar}
              alt={message.sender.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            message.sender?.name?.[0]?.toUpperCase() || 'U'
          )}
        </div>
      )}

      <div className="flex flex-col gap-1">
        {!isSelf && (
          <span className="text-[11px] font-medium text-slate-500 px-1">
            {message.sender?.name}
          </span>
        )}

        <div
          className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed border transition-all ${
            isSelf
              ? 'bg-indigo-600 border-indigo-500/30 text-white rounded-br-sm shadow-sm shadow-indigo-600/10'
              : 'bg-white border-slate-200/90 text-slate-800 rounded-bl-sm shadow-sm shadow-slate-200/40'
          }`}
        >
          {/* Reply Context */}
          {message.replyTo && (
            <div className="mb-2">
              <ReplyPreview reply={message.replyTo} variant="bubble" />
            </div>
          )}

          {/* Text Content */}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {/* Media Links if any */}
          {message.mediaLinks && message.mediaLinks.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {message.mediaLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className={`text-xs underline break-all ${
                    isSelf
                      ? 'text-indigo-100 hover:text-white'
                      : 'text-indigo-600 hover:text-indigo-800'
                  }`}
                >
                  Attachment {idx + 1}
                </a>
              ))}
            </div>
          )}

          {/* Footer: Timestamp & Read Ticks */}
          <div
            className={`flex items-center gap-1.5 justify-end mt-1 text-[10px] ${
              isSelf ? 'text-indigo-100/90' : 'text-slate-400'
            }`}
          >
            <span>{formattedTime}</span>
            {isSelf && (
              <span>
                {isRead ? (
                  <CheckCheck className="w-3.5 h-3.5 text-indigo-100" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-indigo-200/80" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating Hover Context Actions */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 p-1 rounded-xl bg-white/95 border border-slate-200/90 shadow-md backdrop-blur-md z-10 ${
          isSelf ? '-left-20' : '-right-20'
        }`}
      >
        {onReply && (
          <button
            type="button"
            onClick={() => onReply(message)}
            title="Reply"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          title="Copy"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
        {isSelf && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(message._id)}
            title="Delete"
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
