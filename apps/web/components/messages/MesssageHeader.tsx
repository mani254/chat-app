import { useUserStore } from "@/store/useUserStore";
import { PopulatedChatDocument } from "@workspace/database";
import { ArrowLeft, Info, Phone, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import AvatarDiv from "../common/AvatarDiv";
import FeatureComingSoonModal from "../common/FeatureCommingSoonModal";
import GroupAvatarDiv from "../common/GroupAvatarDiv";

const MessageHeader = ({ chat }: { chat: PopulatedChatDocument }) => {
  const router = useRouter();
  const currentUser = useUserStore((s) => s.currentUser);
  const activeUsers = useUserStore((s) => s.activeUsers);

  const [openFeatureCommingSoonModal, setOpenFeatureCommingSoonModal] = useState(false);

  const isGroupChat = chat.isGroupChat;

  /** PARTNER DATA */
  const partner = useMemo(() => {
    if (isGroupChat) {
      const onlineUsers = chat.users.filter((u) =>
        activeUsers.some((au) => au._id === u._id)
      );
      return {
        name: chat.name,
        avatar: chat.avatar || "",
        onlineUsers: onlineUsers || [],
        isOnline: true,
      };
    }

    // Direct Chat
    const user = chat.users.find((u) => u._id !== currentUser?._id);
    const isOnline = activeUsers.some((au) => au._id === user?._id);

    return {
      ...user,
      isOnline,
      onlineUsers: [],
    };
  }, [chat, currentUser, activeUsers, isGroupChat]);

  /** STATUS TEXT */
  const statusText = isGroupChat
    ? partner.onlineUsers.length === 0
      ? "No one online"
      : `${partner.onlineUsers.length} active`
    : partner.isOnline
      ? "Active now"
      : "Offline";

  /** STATUS COLOR */
  const statusColor = !isGroupChat && partner.isOnline
    ? "text-green-500"
    : "text-muted-foreground";

  const handleBack = () => router.push("/");

  return (
    <>
      <header className="h-16 flex items-center justify-between px-4 border-b border-background-accent bg-background">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-full bg-background-accent md:hidden"
            onClick={handleBack}
          >
            <ArrowLeft size={19} />
          </button>

          {isGroupChat ? (
            <GroupAvatarDiv chat={chat} />
          ) : (
            <AvatarDiv user={partner as any} />
          )}

          <div className="flex flex-col">
            <span className="text-sm font-semibold">{partner.name}</span>

            <span className={`text-xs flex items-center gap-1 ${statusColor}`}>
              {!isGroupChat && partner.isOnline && (
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              )}
              {statusText}
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {[Phone, Video, Info].map((Icon, i) => (
            <button
              key={i}
              className="p-2 rounded-full bg-background-accent hover:bg-background-accent/80 transition"
              onClick={() => setOpenFeatureCommingSoonModal(true)}
            >
              <Icon size={19} />
            </button>
          ))}
        </div>
      </header>

      <FeatureComingSoonModal
        open={openFeatureCommingSoonModal}
        onOpenChange={setOpenFeatureCommingSoonModal}
      />
    </>
  );
};

export default MessageHeader;
