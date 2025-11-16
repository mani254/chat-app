import useMediaQuery from "@/hooks/useMediaQuery";
import { useChatStore } from "@/store/useChatStore";
import { useUIStore } from "@/store/useUIStore";
import { mobileWidth } from "@/utils";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";
import { TextInput } from "../formComponents/TextInput";
import ActiveUsersTab from "../users/ActiveUsersTab";
import ChatsTab from "./ChatsTab";
import Header from "./Header";

const ChatSidebar = () => {

  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);

  const isDesktop = useMediaQuery(`(min-width: ${mobileWidth}px)`);
  const activeTab = useChatStore((s) => s.activeTab);
  const setActiveTab = useChatStore((s) => s.setActiveTab);
  const [search, setSearch] = useState("");

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div
          initial={{ x: -260, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -260, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className={cn(
            "fixed md:static h-screen bg-background border-r border-border",
            "w-[300px] md:w-[320px] max-w-full flex flex-col",
            !isDesktop && "w-full"
          )}
        >

          {/* Sticky Header Section */}
          <div className="sticky top-0 bg-background z-20 space-y-2 pb-2 border-b border-border">
            <Header />

            {/* Search */}
            <div className="relative px-2">
              <TextInput
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                inputClass="pl-9 focus:ring-0"
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-accent/70" />
            </div>

            {/* Tabs (only triggers here) */}
            <Tabs value={activeTab} onValueChange={setActiveTab as any} className="px-2">
              <TabsList className="h-auto flex justify-start gap-1 bg-transparent p-0 overflow-x-auto">
                <TabsTrigger
                  value="chats"
                  className={cn(
                    "text-[12px] px-3 py-1 rounded-full border border-primary/50 text-foreground/60",
                    "hover:bg-muted",
                    "data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  )}
                >
                  Chats
                </TabsTrigger>

                <TabsTrigger
                  value="groups"
                  className={cn(
                    "text-[12px] px-3 py-1 rounded-full border border-primary/50 text-foreground/60",
                    "hover:bg-muted",
                    "data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  )}
                >
                  Groups
                </TabsTrigger>

                <TabsTrigger
                  value="users"
                  className={cn(
                    "text-[12px] px-3 py-1 rounded-full border border-primary/50 text-foreground/60",
                    "hover:bg-muted",
                    "data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  )}
                >
                  Active Users
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Scrollable List Section */}
          {activeTab === "chats" && <ChatsTab search={search} />}
          {activeTab === "groups" && <ChatsTab search={search} variant="group" />}
          {activeTab === "users" && <ActiveUsersTab search={search} />}

        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Your list components (temporarily placeholders)
const GroupsList = () => <div>groups</div>;

export default ChatSidebar;
