"use client";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/src/store/useUiStore";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";
import Header from "../Header";

import ActiveUsersTab from "./tabs/ActiveUsersTab";
import ChatsTab from "./tabs/ChatTab";
import GroupsTab from "./tabs/GroupsTab";

const ChatSidebar = () => {
  const { isSidebarOpen } = useUIStore();
  const [search, setSearch] = useState("");

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed md:static bg-background border-r border-background-accent h-full",
            "w-[300px] md:w-1/3 max-w-[340px] py-3 shadow-lg md:shadow-none"
          )}
        >
          <div className="sticky top-0 z-10 bg-background py-1">
            <Header />
            <div className="my-3 px-2">
              <div className="relative">
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn("w-full pl-10 pr-4 py-3 rounded-full text-sm border border-foreground-accent/50")}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className={cn("w-4 h-4")} />
                </span>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="chats" className="w-full px-2">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="chats" className="cursor-pointer">Chats</TabsTrigger>
                <TabsTrigger value="groups" className="cursor-pointer">Groups</TabsTrigger>
                <TabsTrigger value="users" className="cursor-pointer">Active Users</TabsTrigger>
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
