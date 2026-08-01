import React, { useState } from 'react';
import { X, Search, MessageSquare, UserPlus } from 'lucide-react';
import { Input, Spinner } from '@org/ui';
import { useCreateChatMutation } from '@org/internal-sdk';
import { useUsersList } from '../hooks/use-users-list';

interface NewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (chatId: string) => void;
}

export const NewChatDialog: React.FC<NewChatDialogProps> = ({
  isOpen,
  onClose,
  onSelectChat,
}) => {
  const [selectingUserId, setSelectingUserId] = useState<string | null>(null);

  const {
    search,
    setSearch,
    users,
    isLoading,
    isFetchingNextPage,
    scrollRef,
    observerRef,
  } = useUsersList(isOpen);

  const createChatMutation = useCreateChatMutation();

  if (!isOpen) return null;

  const handleSelectUser = async (recipientId: string) => {
    if (selectingUserId) return;
    setSelectingUserId(recipientId);

    try {
      const chat = await createChatMutation.mutateAsync({
        isGroupChat: false,
        recipientId,
      });

      if (chat?._id) {
        onSelectChat(chat._id);
        handleClose();
      }
    } catch (err) {
      console.error('Failed to create or open direct chat:', err);
    } finally {
      setSelectingUserId(null);
    }
  };

  const handleClose = () => {
    setSearch('');
    setSelectingUserId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-2xl shadow-slate-300/50 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">
              New Direct Message
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 px-1 font-medium">
            {search.trim().length > 0 && search.trim().length <= 2
              ? 'Type more than 2 characters to search...'
              : search.trim().length > 2
              ? `Showing search results for "${search.trim()}"`
              : 'Showing top user suggestions'}
          </p>
        </div>

        {/* Paginated User Suggestions Container */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 min-h-[260px] scrollbar-thin scrollbar-thumb-slate-300"
        >
          {isLoading && users.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="md" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 text-slate-400 my-auto">
              <UserPlus className="w-8 h-8 text-slate-300 mb-2 opacity-60" />
              <p className="text-sm font-semibold text-slate-600">
                {search.trim().length > 0 && search.trim().length <= 2
                  ? 'Keep typing to search'
                  : search.trim().length > 2
                  ? 'No matching users found'
                  : 'No users available'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {search.trim().length > 0 && search.trim().length <= 2
                  ? 'Please type at least 3 characters to search by name or email.'
                  : search.trim().length > 2
                  ? `No users matched "${search.trim()}". Try another search term.`
                  : 'There are no other registered users available to start a conversation.'}
              </p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user._id)}
                className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                  selectingUserId === user._id
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* User Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-sm text-indigo-700 overflow-hidden shadow-xs">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name?.[0]?.toUpperCase() || 'U'
                      )}
                    </div>
                    {user.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {user.name}
                    </span>
                    <span className="text-xs text-slate-400 truncate">
                      {user.email}
                    </span>
                  </div>
                </div>

                {/* Selection Indicator */}
                <div className="shrink-0 ml-2">
                  {selectingUserId === user._id ? (
                    <Spinner size="sm" />
                  ) : (
                    <span className="text-xs font-semibold text-indigo-600 group-hover:underline">
                      Chat
                    </span>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Bottom Sentinel & Inline Loader for Infinite Scroll */}
          <div
            ref={observerRef}
            className="h-8 flex items-center justify-center py-2 shrink-0"
          >
            {isFetchingNextPage && <Spinner size="sm" />}
          </div>
        </div>
      </div>
    </div>
  );
};
