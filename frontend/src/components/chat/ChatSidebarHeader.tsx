import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search, X } from "lucide-react";

interface ChatSidebarHeaderProps {
  search: string;
  setSearch: (val: string) => void;
  toggleSidebar: () => void;
}

const ChatSidebarHeader = ({ search, setSearch, toggleSidebar }: ChatSidebarHeaderProps) => (
  <div className="p-4 border-b border-background-accent">
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl font-semibold flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-blue-600" />
        Chats
      </h1>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSidebar}
        className="lg:hidden"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        placeholder="Search conversations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10 bg-background border-background-accent"
      />
    </div>
  </div>
);

export default ChatSidebarHeader;
