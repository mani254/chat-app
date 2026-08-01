import { useCurrentUser, useLogout } from '@org/internal-sdk';
import { Input, Logo, Spinner } from '@org/ui';
import { LogOut, MessageSquare, Search, Users } from 'lucide-react';
import React from 'react';
import { useChatsList } from '../hooks/use-chats-list';
import { ChatListItem } from './chat-list-item';

interface ChatSidebarProps {
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  activeChatId,
  onSelectChat,
  onOpenNewChat,
  onOpenNewGroup,
}) => {
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const {
    tab,
    setTab,
    search,
    setSearch,
    chats,
    isLoading,
    isFetchingNextPage,
    scrollRef,
    observerRef,
  } = useChatsList(activeChatId);

  return (
    <div className="w-full md:w-80 lg:w-88 h-full bg-slate-50/90 border-r border-slate-200/80 flex flex-col shrink-0">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200/80 flex flex-col gap-3 bg-white/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenNewChat}
              title="New Message"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenNewGroup}
              title="New Group"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              title="Logout"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Database Search Input */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-slate-200/80 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl shadow-xs"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Category Tabs (Segmented Control) */}
        <div className="flex p-1 bg-slate-200/60 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${tab === 'all'
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setTab('direct')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${tab === 'direct'
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Direct
          </button>
          <button
            type="button"
            onClick={() => setTab('group')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${tab === 'group'
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Conversations List Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-slate-300"
      >
        {isLoading && chats.length === 0 ? (
          <div className="flex justify-center py-10">
            <Spinner size="md" />
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 text-slate-400 my-auto">
            <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No conversations found</p>
            <p className="text-xs text-slate-400 mt-1">Start a new message to begin!</p>
          </div>
        ) : (
          chats.map((chat) => (
            <ChatListItem
              key={chat._id}
              chat={chat}
              currentUser={user || null}
              isActive={chat._id === activeChatId}
              onClick={() => onSelectChat(chat._id)}
            />
          ))
        )}

        {/* Bottom Sentinel and Inline Loader for Infinite Scroll */}
        {(!isLoading || !isFetchingNextPage) && <div ref={observerRef} className="h-8 flex items-center justify-center py-2 shrink-0">
          {isFetchingNextPage && <Spinner size="sm" />}
        </div>}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Log Out</h3>
                <p className="text-xs text-slate-500 mt-0.5">Are you sure you want to sign out of your account?</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={logoutMutation.isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-sm shadow-rose-200"
              >
                {logoutMutation.isPending ? (
                  <>
                    <Spinner size="sm" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <span>Log Out</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
