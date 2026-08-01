import { useInfiniteUsersQuery } from '@org/internal-sdk';
import type { UserSummary } from '@org/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from '../../../hooks/use-debounce';

export function useUsersList(isOpen = true) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Paginated user discovery infinite query (initial 10 users, 10 per page on scroll)
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteUsersQuery(debouncedSearch);

  // Local state for users list
  const [users, setUsers] = useState<UserSummary[]>([]);

  // Sync fetched infinite query pages to local users state
  useEffect(() => {
    if (!data?.pages) return;
    const fetchedUsers = data.pages.flatMap((page) => page.items);
    setUsers(fetchedUsers);
  }, [data]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setUsers([]);
    }
  }, [isOpen]);

  // IntersectionObserver Sentinel for Infinite Scroll
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const observeSentinel = useCallback(() => {
    const container = scrollRef.current;
    const sentinel = observerRef.current;
    if (!container || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage && hasNextPage) {
          fetchNextPage();
        }
      },
      { root: container, threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (!isOpen) return;
    const cleanup = observeSentinel();
    return cleanup;
  }, [isOpen, observeSentinel]);

  return {
    search,
    setSearch,
    users,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    scrollRef,
    observerRef,
  };
}
