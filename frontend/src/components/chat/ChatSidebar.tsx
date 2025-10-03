"use client";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/src/store/useUiStore";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "../Header";

import useMediaQuery from "@/src/hooks/useMediaQuery";
import { useUserStore } from "@/src/store/useUserStore";
import ActiveUsersTab from "./tabs/ActiveUsersTab";
import ChatsTab from "./tabs/ChatTab";
import GroupsTab from "./tabs/GroupsTab";

const ChatSidebar = () => {
  const { isSidebarOpen } = useUIStore();
  const [search, setSearch] = useState("");

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const setActiveUsers = useUserStore((state) => state.setActiveUsers)

  useEffect(() => {
    setActiveUsers();
  }, [setActiveUsers]);

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed md:static h-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-r border-border",
            "w-[300px] md:w-1/3 max-w-[340px] py-4 shadow md:shadow-none",
            !isDesktop && "w-full max-w-full"
          )}
        >
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur py-1 border-b border-border">
            <Header />
            <div className="my-3 px-3">
              <div className="relative">
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn("w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-background-accent/50 border border-border placeholder:text-foreground-accent/70 focus-visible:ring-2 focus-visible:ring-primary/30")}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-accent">
                  <Search className={cn("w-4 h-4")} />
                </span>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="chats" className="w-full px-3">
              <TabsList className="w-full grid grid-cols-3 bg-background-accent/50 rounded-xl p-1">
                <TabsTrigger value="chats" className="cursor-pointer rounded-lg data-[state=active]:bg-background data-[state=active]:shadow">Chats</TabsTrigger>
                <TabsTrigger value="groups" className="cursor-pointer rounded-lg data-[state=active]:bg-background data-[state=active]:shadow">Groups</TabsTrigger>
                <TabsTrigger value="users" className="cursor-pointer rounded-lg data-[state=active]:bg-background data-[state=active]:shadow">Active Users</TabsTrigger>
              </TabsList>

              <TabsContent value="chats">
                <ChatsTab search={search} />
              </TabsContent>

              <TabsContent value="groups">
                <GroupsTab search={search} />
              </TabsContent>

              <TabsContent value="users">
                <ActiveUsersTab />
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatSidebar;
