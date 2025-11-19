"use client";

import { create } from "zustand";
import { devtools, persist, subscribeWithSelector, createJSONStorage } from "zustand/middleware";

export interface ShortsVideoItem {
  _id: string;
  title: string;
  description: string;
  playbackId: string;
  uploadedBy: string;
  likes?: number;
  comments?: number;
  views?: number;
}

interface State {
  videos: ShortsVideoItem[];
  currentIndex: number;
  total: number;
  page: number;
  limit: number;
  prefetchQueue: string[];
  loading: boolean;
}

interface Actions {
  setVideos: (items: ShortsVideoItem[], total: number) => void;
  setCurrentIndex: (i: number) => void;
  setLoading: (loading: boolean) => void;
  enqueuePrefetch: (id: string) => void;
  shiftPrefetch: () => string | undefined;
}

export const useShortsStore = create<State & Actions>()(
  devtools(
    persist(
      subscribeWithSelector((set) => ({
        videos: [],
        currentIndex: 0,
        total: 0,
        page: 1,
        limit: 12,
        prefetchQueue: [],
        loading: false,
        setVideos: (items, total) => set(() => ({ videos: items, total })),
        setCurrentIndex: (i) => set(() => ({ currentIndex: i })),
        setLoading: (loading) => set(() => ({ loading })),
        enqueuePrefetch: (id) => set((s) => ({ prefetchQueue: [...s.prefetchQueue, id] })),
        shiftPrefetch: () => {
          let popped: string | undefined;
          set((s) => {
            if (s.prefetchQueue.length > 0) {
              const [first, ...rest] = s.prefetchQueue;
              popped = first;
              return { prefetchQueue: rest };
            }
            return s;
          });
          return popped;
        },
      })),
      {
        name: "mux-shorts-store",
        storage: createJSONStorage(() => localStorage),
        partialize: (s) => ({ currentIndex: s.currentIndex }),
      },
    ),
    { name: "mux-shorts-store" },
  ),
);