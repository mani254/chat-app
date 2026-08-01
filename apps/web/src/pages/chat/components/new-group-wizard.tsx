import React, { useState } from 'react';
import { X, Users, ArrowRight, ArrowLeft, Check, Search, UserPlus, ShieldCheck } from 'lucide-react';
import { Button, Input, Spinner } from '@org/ui';
import { useCreateChatMutation, useCurrentUser } from '@org/internal-sdk';
import type { UserSummary } from '@org/shared';
import { useUsersList } from '../hooks/use-users-list';

interface NewGroupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (chatId: string) => void;
}

export const NewGroupWizard: React.FC<NewGroupWizardProps> = ({
  isOpen,
  onClose,
  onSelectChat,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserSummary[]>([]);

  const { data: currentUser } = useCurrentUser();
  const createChatMutation = useCreateChatMutation();

  // Custom hook for infinite scrolling paginated user discovery (active during step 2)
  const {
    search,
    setSearch,
    users,
    isLoading,
    isFetchingNextPage,
    scrollRef,
    observerRef,
  } = useUsersList(isOpen && step === 2);

  if (!isOpen) return null;

  const toggleSelectUser = (user: UserSummary) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u._id === user._id);
      if (exists) {
        return prev.filter((u) => u._id !== user._id);
      }
      return [...prev, user];
    });
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  const handleReset = () => {
    setStep(1);
    setName('');
    setDescription('');
    setSelectedUsers([]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim() || selectedUsers.length === 0) return;

    try {
      const chat = await createChatMutation.mutateAsync({
        isGroupChat: true,
        name: name.trim(),
        description: description.trim(),
        userIds: selectedUsers.map((u) => u._id),
      });
      if (chat?._id) {
        onSelectChat(chat._id);
        handleClose();
      }
    } catch (err) {
      console.error('Failed to create group:', err);
    }
  };

  // Mandatory fields validation
  const canProceedStep1 = name.trim().length > 0;
  const canProceedStep2 = selectedUsers.length >= 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl shadow-2xl shadow-slate-300/50 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Create New Group (Step {step} of 3)
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

        {/* Step Progress Bar */}
        <div className="h-1 bg-slate-100 w-full flex">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-hidden flex flex-col min-h-[300px]">
          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Group Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Product Engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl"
                  autoFocus
                />
                {!name.trim() && (
                  <p className="text-[11px] text-slate-400">Group name is mandatory.</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="What is this group about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Add Members with Combobox & Badges */}
          {step === 2 && (
            <div className="flex-1 flex flex-col gap-3 min-h-0">
              {/* Selected Members Badges Bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Selected Members
                  </label>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {selectedUsers.length} selected
                  </span>
                </div>

                {selectedUsers.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto p-2 bg-slate-50/80 rounded-2xl border border-slate-200/70 scrollbar-thin">
                    {selectedUsers.map((u) => (
                      <span
                        key={u._id}
                        className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-xl text-xs font-medium bg-white text-slate-800 border border-slate-200/80 shadow-xs animate-in zoom-in-95 duration-100"
                      >
                        <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-bold shrink-0 overflow-hidden">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            u.name?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>
                        <span className="truncate max-w-[100px]">{u.name}</span>
                        <button
                          type="button"
                          onClick={() => removeUser(u._id)}
                          className="p-0.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic px-1">
                    No members selected yet. Search and select below.
                  </p>
                )}
              </div>

              {/* Combobox Search Input */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search members by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Paginated Combobox Dropdown List */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-2 bg-slate-50/50 rounded-2xl border border-slate-200/70 flex flex-col gap-1 min-h-[160px] scrollbar-thin scrollbar-thumb-slate-300"
              >
                {isLoading && users.length === 0 ? (
                  <div className="flex justify-center items-center py-8">
                    <Spinner size="md" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400 my-auto">
                    <UserPlus className="w-6 h-6 text-slate-300 mb-1 opacity-60" />
                    <p className="text-xs font-semibold text-slate-600">No users found</p>
                  </div>
                ) : (
                  users.map((user) => {
                    const isSelected = selectedUsers.some((u) => u._id === user._id);
                    return (
                      <div
                        key={user._id}
                        onClick={() => toggleSelectUser(user)}
                        className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950 shadow-xs'
                            : 'bg-white border-slate-100 hover:bg-slate-100/70 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* User Avatar */}
                          <div className="relative shrink-0">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-700 overflow-hidden">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                user.name?.[0]?.toUpperCase() || 'U'
                              )}
                            </div>
                            {user.isOnline && (
                              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {user.name}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">
                              {user.email}
                            </span>
                          </div>
                        </div>

                        {/* Selection Checkmark Indicator */}
                        <div className="shrink-0 ml-2">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-slate-300 group-hover:border-indigo-400 transition-colors" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Bottom Sentinel for Infinite Scroll */}
                <div ref={observerRef} className="h-6 flex items-center justify-center py-1 shrink-0">
                  {isFetchingNextPage && <Spinner size="sm" />}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review Details */}
          {step === 3 && (
            <div className="flex flex-col gap-4 text-sm text-slate-700">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{name}</h4>
                    {description ? (
                      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No description provided</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Group Admin:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    {currentUser?.name || 'You'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/70 flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">
                    Members ({selectedUsers.length + 1} total):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto">
                    {/* Admin badge */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                      <ShieldCheck className="w-3 h-3 text-indigo-600" />
                      {currentUser?.name || 'You'} (Admin)
                    </span>

                    {/* Member badges */}
                    {selectedUsers.map((u) => (
                      <span
                        key={u._id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-xs"
                      >
                        {u.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              type="button"
              size="sm"
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2)
              }
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={createChatMutation.isPending || !canProceedStep1 || !canProceedStep2}
              onClick={handleSubmit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
            >
              {createChatMutation.isPending ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  Create Group
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
