import { useUserStore } from '@/src/store/useUserStore';
import { Chat, User } from '@/src/types';
import { Info, Phone, Video } from 'lucide-react';
import AvatarDiv from '../../ui/Avatar';

const MessageHeader = ({ chat }: { chat: Chat }) => {
  const currentUser = useUserStore((s) => s.currentUser);

  const isGroupChat = chat.isGroupChat;

  const partner: Partial<User> | { name: string; avatar: string; onlineUsers: User[] } = isGroupChat
    ? {
      name: chat.name,
      avatar: chat.avatar || '',
      onlineUsers: chat.users.filter((u) => u.isOnline),
    }
    : chat.users.find((u) => u._id !== currentUser?._id)!;

  const renderStatus = () => {
    if (isGroupChat && 'onlineUsers' in partner) {
      const count = partner.onlineUsers.length;
      return (
        <p className="text-xs text-muted-foreground">
          {count === 0
            ? 'No one is online'
            : `${count} active ${count === 1 ? 'user' : 'users'}`}
        </p>
      );
    }

    if (!isGroupChat && 'isOnline' in partner) {
      return partner.isOnline ? (
        <p className="text-xs text-green-500 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
          Active now
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Offline</p>
      );
    }

    return null;
  };

  return (
    <div className="h-16 flex items-center justify-between border-b bg-background border-background-accent shadow-sm px-4">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <AvatarDiv user={partner as User} className="w-8 h-8" />

        <div className="flex flex-col">
          <h5 className="text-lg font-semibold">{partner?.name || 'Unknown'}</h5>
          {renderStatus()}
        </div>
      </div>

      {/* Right side */}
      <div className="flex gap-2 items-center">
        <div className="p-2 bg-background-accent rounded-full cursor-pointer hover:bg-background-accent/80 transition">
          <Phone size={19} />
        </div>

        <div className="p-2 bg-background-accent rounded-full cursor-pointer hover:bg-background-accent/80 transition">
          <Video size={19} />
        </div>

        <div className="p-2 bg-background-accent rounded-full cursor-pointer hover:bg-background-accent/80 transition">
          <Info size={19} />
        </div>
      </div>
    </div>
  );
};

export default MessageHeader;
