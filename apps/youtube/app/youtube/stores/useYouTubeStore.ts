'use client';

import { create } from 'zustand';
import { createJSONStorage, devtools, persist, subscribeWithSelector } from 'zustand/middleware';

type UploadStatus = 'queued' | 'uploading' | 'uploaded' | 'processing' | 'ready' | 'failed' | 'canceled';

export interface UploadItem {
  id: string;
  fileName: string;
  size: number;
  progress: number;
  status: UploadStatus;
  directUploadUrl?: string;
  assetId?: string;
  playbackId?: string;
  error?: string;
}

export interface VideoItem {
  _id: string;
  title: string;
  playbackId?: string;
  category?: string;
  visibility: 'public' | 'unlisted' | 'private';
  type: 'long' | 'short';
  uploadedBy: string;
  likes?: number;
  views?: number;
  comments?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface State {
  uploads: Record<string, UploadItem>;
  feed: VideoItem[];
  page: number;
  total: number;
  limit: number;
  query: string;
  category: string | null;
  loadingFeed: boolean;
}

interface Actions {
  addUpload: (u: UploadItem) => void;
  updateUpload: (id: string, patch: Partial<UploadItem>) => void;
  removeUpload: (id: string) => void;
  setFeed: (items: VideoItem[], total: number, page: number) => void;
  appendFeed: (items: VideoItem[], total?: number) => void;
  setQuery: (q: string) => void;
  setCategory: (c: string | null) => void;
  setLoadingFeed: (v: boolean) => void;
}

export const useYouTubeStore = create<State & Actions>()(
  devtools(
    persist(
      subscribeWithSelector((set) => ({
        uploads: {},
        feed: [],
        page: 1,
        total: 0,
        limit: 20,
        query: '',
        category: null,
        loadingFeed: false,
        addUpload: (u) => set((s) => ({ uploads: { ...s.uploads, [u.id]: u } })),
        updateUpload: (id, patch) =>
          set((s) => {
            const prev: UploadItem =
              s.uploads[id] ??
              ({
                id,
                fileName: '',
                size: 0,
                progress: 0,
                status: 'queued',
              } as UploadItem);
            return { uploads: { ...s.uploads, [id]: { ...prev, ...patch } } };
          }),
        removeUpload: (id) =>
          set((s) => {
            const next = { ...s.uploads };
            delete next[id];
            return { uploads: next };
          }),
        setFeed: (items, total, page) => set(() => ({ feed: items, total, page })),
        appendFeed: (items, total) => set((s) => ({ feed: [...s.feed, ...items], total: total ?? s.total })),
        setQuery: (q) => set(() => ({ query: q })),
        setCategory: (c) => set(() => ({ category: c })),
        setLoadingFeed: (v) => set(() => ({ loadingFeed: v })),
      })),
      {
        name: 'mux-youtube-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (s) => ({ uploads: s.uploads }),
      },
    ),
    { name: 'mux-youtube-store' },
  ),
);
