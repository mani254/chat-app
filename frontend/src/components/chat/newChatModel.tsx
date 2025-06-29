import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/src/store/useUserStore";
import { Plus, Search } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const NewChatModal = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const users = useUserStore((state) => state.users);
  const setUsers = useUserStore((state) => state.setUsers);
  const hasMoreUsers = useUserStore((state => state.hasMoreUsers));

  // Load users on page/search change
  useEffect(() => {
    if (!open) return
    const fetchUsers = async () => {
      setLoading(true);
      await setUsers({ search, page, limit: 10, filterMain: true })

      setLoading(false);
    };
    fetchUsers();
  }, [search, page, setUsers, open]);



  // Reset page to 1 on new search
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Infinite scroll handler
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {

      const target = entries[0];
      console.log(target.isIntersecting, hasMoreUsers, loading, target)
      if (target.isIntersecting && hasMoreUsers && !loading) {
        setPage((prev) => prev + 1);
        console.log('fetched the users')
      }
    },
    [loading, hasMoreUsers]
  );

  // Attach IntersectionObserver to last element
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    const sentinel = observerRef.current;
    if (!scrollContainer || !sentinel) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: scrollContainer,
      threshold: 1.0,
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleObserver]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="New Chat"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow hover:bg-gray-100 transition border border-gray-200"
        >
          <Plus className="w-5 h-5 text-gray-700" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md w-full rounded-2xl p-0 overflow-hidden bg-white border border-gray-200 shadow-xl">
        <DialogHeader className="p-5 pb-2 border-b border-gray-100">
          <DialogTitle className="text-base font-semibold text-gray-900">
            Start a new chat
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pt-3">
          {/* Search Bar */}
          <div className="mb-2 relative">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white text-sm",
                loading && "pr-10"
              )}
              style={{ minHeight: 38 }}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className={cn("w-4 h-4", loading && "animate-spin")} />
            </span>
          </div>

          {/* User List */}
          <div
            ref={scrollRef}
            className="user-scroll-container space-y-2 h-72 overflow-y-auto pr-1 custom-scrollbar"
          >
            {loading && page === 1 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg bg-gray-100" />
              ))
            ) : users.length === 0 ? (
              <div className="text-gray-400 text-center py-6 text-sm">
                No users found.
              </div>
            ) : (
              users.map((user) => (
                <button
                  key={user._id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-left"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.email}
                    </span>
                  </div>

                  <div className="ml-auto">
                    <span
                      className={`text-xs px-2 py-0.5 border rounded ${user.isOnline
                        ? "bg-green-100 text-green-600 border-green-200"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                    >
                      {user.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </button>
              ))
            )}

            {/* Infinite scroll sentinel */}
            {hasMoreUsers && (
              <div ref={observerRef} className="h-8 flex justify-center items-center">
                {loading && (
                  <span className="text-xs text-gray-400">Loading more...</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Close button */}
        <div className="px-5 pb-3 flex justify-end ">
          <DialogClose asChild>
            <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium text-sm">
              Close
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatModal;
