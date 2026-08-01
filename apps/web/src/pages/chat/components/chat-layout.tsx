import { SocketProvider } from '@org/internal-sdk';
import React, { useState } from 'react';
import { ChatSidebar } from './chat-sidebar';
import { ChatWindow } from './chat-window';
import { NewChatDialog } from './new-chat-dialog';
import { NewGroupWizard } from './new-group-wizard';

export const ChatLayout: React.FC = () => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);

  return (
    <SocketProvider>
      <div className="h-screen w-screen flex bg-[#F5F5F7] text-slate-900 overflow-hidden font-sans antialiased">
        {/* Sidebar View (hidden on mobile if a chat is active) */}
        <div
          className={`h-full ${activeChatId ? 'hidden md:flex' : 'flex w-full md:w-auto'
            }`}
        >
          <ChatSidebar
            activeChatId={activeChatId}
            onSelectChat={(id) => setActiveChatId(id)}
            onOpenNewChat={() => setIsNewChatOpen(true)}
            onOpenNewGroup={() => setIsNewGroupOpen(true)}
          />
        </div>

        {/* Conversation Main Pane (hidden on mobile if no active chat) */}
        <div
          className={`flex-1 h-full ${!activeChatId ? 'hidden md:flex' : 'flex'
            }`}
        >
          <ChatWindow
            chatId={activeChatId}
            onBack={() => setActiveChatId(null)}
          />
        </div>

        {/* New Direct Message Modal */}
        <NewChatDialog
          isOpen={isNewChatOpen}
          onClose={() => setIsNewChatOpen(false)}
          onSelectChat={(id) => setActiveChatId(id)}
        />

        {/* New Group Creation Wizard */}
        <NewGroupWizard
          isOpen={isNewGroupOpen}
          onClose={() => setIsNewGroupOpen(false)}
          onSelectChat={(id) => setActiveChatId(id)}
        />
      </div>
    </SocketProvider>
  );
};
