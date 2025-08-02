import { useChatStore } from '@/src/store/useChatStore';
import { useUserStore } from '@/src/store/useUserStore';
import { User } from '@/src/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AvatarDiv from '../../ui/Avatar';
import NoActiveUsersFound from './NoActiveUsersFound';

const ActiveUsers = () => {

  const activeUsers = useUserStore((state) => state.activeUsers);
  const setActiveUsers = useUserStore((state) => state.setActiveUsers);
  const currentUser = useUserStore((state) => state.currentUser);
  const createChat = useChatStore((state) => state.createChat);
  const router = useRouter();

  useEffect(() => {
    setActiveUsers();
  }, [setActiveUsers]);

  async function handleCreateChat(user: User) {
    const info = {
      users: [currentUser!._id, user._id],
      isGroupChat: false,
      name: '',
      groupAdmin: undefined,
    };
    const res = await createChat(info);
    router.push(`/?chatId=${res._id}`);
  }

  return (
    <div className="w-full px-4 py-3 border-b border-background-accent overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-transparent">
      <div className="flex items-center gap-4">
        {activeUsers.length ? activeUsers.map((user) => (
          <div
            key={user._id}
            onClick={() => handleCreateChat(user)}
            className="group relative flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            {/* Avatar with online dot */}
            <div className="relative flex gap-3">
              <AvatarDiv user={user} />
              <div className="flex flex-col">
                <span className="text-sm font-medium mb-1">{user.name}</span>
                <span className="text-xs text-foreground-accent">{user.status}</span>
              </div>
            </div>
          </div>
        )) : (<NoActiveUsersFound />)}
      </div>
    </div>
  );
};

export default ActiveUsers;
