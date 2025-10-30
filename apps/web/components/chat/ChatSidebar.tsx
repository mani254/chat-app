import useMediaQuery from "@/hooks/useMediaQuery";
import { useUIStore } from "@/store/useUIStore";
import { useUserStore } from "@/store/useUserStore";
import { mobileWidth } from "@/utils";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { TextInput } from "../formComponents/TextInput";
import ChatsTab from "./ChatsTab";
import Header from "./Header";

const ChatSidebar = () => {
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const setActiveUsers = useUserStore((s) => s.setActiveUsers);
  const isDesktop = useMediaQuery(`(min-width: ${mobileWidth}px)`);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("chats");

  useEffect(() => {
    setActiveUsers();
  }, [setActiveUsers]);

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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="px-2">
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
          {activeTab === "chats" && <ChatsTab />}
          {activeTab === "groups" && <GroupsList />}
          {activeTab === "users" && <UsersList />}

        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Your list components (temporarily placeholders)
const GroupsList = () => <div>groups</div>;
const UsersList = () => <div>users</div>;

export default ChatSidebar;
