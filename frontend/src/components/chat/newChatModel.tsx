"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/src/store/useChatStore";
import { useUserStore } from "@/src/store/useUserStore";
import { User } from "@/src/types";
import { DialogDescription } from "@radix-ui/react-dialog";
import { debounce } from "lodash";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import AvatarDiv from "../Avatar";
import LoadMoreLoader from "../loaders/LoadMoreLoader";


const NewChatModal = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const users = useUserStore((state) => state.users);
  const totalUsers = useUserStore((state) => state.totalUsers);
  const loadingUsers = useUserStore((state) => state.loadingUsers);
  const loadUsers = useUserStore((state) => state.loadUsers);
  const createChat = useChatStore((state) => state.createChat)
  const currentUser = useUserStore((state) => state.currentUser)


  // Debounced search effect
  const debouncedSearch = useRef(
    debounce((value: string) => {
      loadUsers(value, { reset: true });
    }, 300)
  ).current;

  useEffect(() => {
    if (open) debouncedSearch(search);
  }, [search, open, debouncedSearch]);

  // Intersection observer for infinite scroll
  const observeSentinel = useCallback(() => {
    const scrollEl = scrollRef.current;
    const sentinel = observerRef.current;
    if (!scrollEl || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const hasMore = users.length < totalUsers - 1;
        if (entry.isIntersecting && !loadingUsers && hasMore) {
          loadUsers(search);
        }
      },
      { root: scrollEl, threshold: 1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [users.length, totalUsers, loadingUsers, loadUsers, search]);

  useEffect(() => {
    const cleanup = observeSentinel();
    return cleanup;
  }, [observeSentinel]);

  async function handleCreateChat(user: User) {
    const info = {
      users: [currentUser!._id, user._id],
      isGroupChat: false,
      name: "",
      groupAdmin: undefined
    }
    await createChat(info).then(res => {
      setOpen(false)
      router.push(`/?chatId=${res._id}`)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="New Chat"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-background-accent shadow hover:bg-background transition cursor-pointer text-background hover:text-background-accent"
        >
          <Plus className="w-5 h-5" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md w-full rounded-2xl p-0 border  shadow-xl">
        <DialogHeader className="p-5 pb-2 border-b border-background-accent">
          <DialogTitle className=" font-semibold mb-2">
            Start a new chat
          </DialogTitle>
          <DialogDescription aria-describedby={undefined}>
          </DialogDescription>
        </DialogHeader>

        <div className="">
          {/* Search Bar */}
          <div className="mb-2 relative mx-5">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-2 rounded-2xl border border-foreground-accent/50 text-sm",
                loadingUsers && "pr-10"
              )}
              style={{ minHeight: 38 }}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className={cn("w-4 h-4", loadingUsers && "animate-spin")} />
            </span>
          </div>

          {/* User List */}
          <ScrollArea
            ref={scrollRef}
            className="h-72 px-4"
          >
            {loadingUsers && users.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-2xl bg-background-accent" />
              ))
            ) : users.length === 0 ? (
              <div className="text-gray-400 text-center py-6 text-sm">
                No users found.
              </div>
            ) : (
              users.map((user) => (
                <button
                  key={user._id}
                  className="w-full flex items-center gap-3 px-3 py-2 mb-2 rounded-2xl hover:bg-background-accent/50 cursor-pointer transition text-left"
                  onClick={() => handleCreateChat(user)}
                >
                  <AvatarDiv user={user} />

                  <div className="flex flex-col">
                    <span className="text-sm font-medium mb-1">
                      {user.name}
                    </span>
                    <span className="text-xs text-foreground-accent">{user.status}</span>
                  </div>

                  <div className="ml-auto">
                    <span
                      className={`text-xs px-2 py-0.5 border rounded ${user.isOnline
                        ? "bg-green-100 text-green-600 border-green-200"
                        : "bg-background-accent border-background text-background"
                        }`}
                    >
                      {user.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </button>
              ))
            )}

            {/* Infinite scroll sentinel */}
            <div ref={observerRef} className="h-8 flex justify-center items-center">
              {loadingUsers && users.length > 0 && (
                // <span className="text-xs text-gray-400">Loading more...</span>
                <LoadMoreLoader />
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Close button */}
        {/* <div className="px-3 flex justify-end">
          <DialogClose asChild>
            <button className="px-4 py-2 rounded-lg  transition font-medium text-sm">
              Close
            </button>
          </DialogClose>
        </div> */}
      </DialogContent>
    </Dialog>
  );
};

export default NewChatModal;
