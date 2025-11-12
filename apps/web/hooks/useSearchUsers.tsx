// hooks/useSearchUsers.ts
import { useUserStore } from "@/store/useUserStore";
import { debounce } from "lodash";
import { useCallback, useEffect, useRef } from "react";

export const useSearchUsers = (search: string, scrollRef: React.RefObject<HTMLDivElement> | null, sentinelRef: React.RefObject<HTMLDivElement> | null, enabled: boolean) => {
  const loadUsers = useUserStore((s) => s.loadUsers);
  const users = useUserStore((s) => s.users);
  const totalUsers = useUserStore((s) => s.totalUsers);
  const loadingUsers = useUserStore((s) => s.loadingUsers);

  const debouncedSearch = useRef(
    debounce((value: string) => {
      loadUsers(value, { reset: true });
    }, 300)
  ).current;

  useEffect(() => {
    if (enabled) {
      debouncedSearch(search);
    }
  }, [search, enabled, debouncedSearch]);

  // Infinite Scroll
  const observe = useCallback(() => {
    const el = scrollRef?.current;
    const sentinel = sentinelRef?.current;
    if (!el || !sentinel) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return
      const hasMore = users.length < totalUsers - 1;
      if (entry.isIntersecting && !loadingUsers && hasMore) {
        loadUsers(search);
      }
    }, { root: el, threshold: 1 });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [scrollRef, sentinelRef, users.length, totalUsers, loadingUsers, loadUsers, search]);

  useEffect(() => {
    if (enabled) {
      const cleanup = observe();
      return cleanup;
    }
  }, [observe, enabled]);

  return { users, loadingUsers };
};
