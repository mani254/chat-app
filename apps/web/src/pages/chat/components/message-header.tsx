import React from 'react';
import { ArrowLeft, Users, MoreVertical } from 'lucide-react';
import type { ChatResponse, UserSummary } from '@org/shared';

interface MessageHeaderProps {
  chat: ChatResponse;
  currentUser: UserSummary | null;
  onBack?: () => void;
}

export const MessageHeader: React.FC<MessageHeaderProps> = ({
  chat,
  currentUser,
  onBack,
}) => {
  // Compute DM partner or Group details
  const isGroup = chat.isGroupChat;
  const dmUser = !isGroup
    ? chat.users?.find((u) => u._id !== currentUser?._id) || chat.users?.[0]
    : null;

  const title = isGroup ? chat.name || 'Group Chat' : dmUser?.name || 'User';
  const avatar = isGroup ? chat.avatar : dmUser?.avatar;
  const isOnline = !isGroup && (dmUser?.isOnline ?? false);

  return (
    <div className="h-16 px-4 border-b border-slate-200/80 bg-white/90 backdrop-blur-md flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile Back Button */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-sm text-indigo-700 overflow-hidden shrink-0 shadow-sm">
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

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 truncate">{title}</h2>
            {isGroup && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Group
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {isGroup
              ? `${chat.users?.length || 0} members`
              : isOnline
              ? 'Online'
              : 'Offline'}
          </p>
        </div>
      </div>

      {/* Right Options */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
