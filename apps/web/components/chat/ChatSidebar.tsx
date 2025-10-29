import useMediaQuery from "@/hooks/useMediaQuery";
import { useUIStore } from "@/store/useUIStore";
import { useUserStore } from "@/store/useUserStore";
import { mobileWidth } from "@/utils";
import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Header from "./Header";

const ChatSidebar = () => {

  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const setActiveUsers = useUserStore((s) => s.setActiveUsers)
  const isDesktop = useMediaQuery(`(min-width: ${mobileWidth}px)`)

  const [search, setSearch] = useState("");

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
            "w-[300px] md:w-1/3 max-w-[340px] shadow md:shadow-none",
            !isDesktop && "w-full max-w-full"
          )}
        >
          <div className="sticky top-0 z-10 border-b border-border">
            <Header />
          </div>
        </motion.div>)}
    </AnimatePresence>
  )
}

export default ChatSidebar
