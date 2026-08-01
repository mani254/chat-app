import type { ChatResponse, UserSummary } from '@org/shared';
import { Image as ImageIcon, Mic, Users } from 'lucide-react';
import React from 'react';

interface ChatListItemProps {
  chat: ChatResponse;
  currentUser: UserSummary | null;
  isActive: boolean;
  onClick: () => void;
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export const ChatListItem: React.FC<ChatListItemProps> = React.memo(({
  chat,
  currentUser,
  isActive,
  onClick,
}) => {
  const isGroup = chat.isGroupChat;
  const dmUser = !isGroup
    ? chat.users?.find((u) => u._id !== currentUser?._id) || chat.users?.[0]
    : null;

  const title = isGroup ? chat.name || 'Group Chat' : dmUser?.name || 'User';
  const avatar = isGroup ? chat.avatar : dmUser?.avatar;
  const isOnline = !isGroup && (dmUser?.isOnline ?? false);

  const formattedTime = formatTime(chat.latestMessage?.createdAt);

  const isSelf = chat.latestMessage?.sender?._id === currentUser?._id;
  const senderName = isSelf ? 'You' : (chat.latestMessage?.sender?.name || 'User');

  const renderMessagePreview = () => {
    if (!chat.latestMessage) {
      return <span className="italic text-slate-400">No messages yet</span>;
    }

    const msg = chat.latestMessage;
    let previewText = msg.content;

    if (msg.messageType === 'note') {
      previewText = 'Voice Note';
    } else if (msg.messageType === 'media' && (!msg.content || msg.content.startsWith('http'))) {
      previewText = 'Media Attachment';
    }

    return (
      <span className="truncate">
        <span className="text-slate-700 font-medium">{senderName}: </span>
        {msg.messageType === 'note' && <Mic className="w-3 h-3 inline mr-1 text-indigo-500" />}
        {msg.messageType === 'media' && <ImageIcon className="w-3 h-3 inline mr-1 text-indigo-500" />}
        <span>{previewText}</span>
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${isActive
        ? 'bg-indigo-50/80 border-indigo-200/90 text-indigo-950 shadow-sm'
        : 'bg-white/70 border-slate-200/60 hover:bg-slate-100/80 text-slate-800'
        }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-sm text-indigo-700 overflow-hidden shadow-sm">
          {avatar ? (
            <img src={avatar} alt={title} className="w-full h-full object-cover" />
          ) : isGroup ? (
            <Users className="w-5 h-5 text-indigo-600" />
          ) : (
            title[0]?.toUpperCase() || 'U'
          )}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          {formattedTime && (
            <span className="text-[10px] text-slate-400 font-medium shrink-0">
              {formattedTime}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500 truncate flex items-center">
            {renderMessagePreview()}
          </p>

          {chat.unreadCount > 0 && !isActive && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shrink-0 shadow-sm">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

ChatListItem.displayName = 'ChatListItem';
