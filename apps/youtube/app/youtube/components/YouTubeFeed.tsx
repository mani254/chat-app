"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import api from "@/lib/api";
import { useYouTubeStore } from "../stores/useYouTubeStore";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Skeleton } from "@workspace/ui/components/skeleton";
import HoverPreview from "./HoverPreview";
import { useInView } from "react-intersection-observer";
import { Flag, Eye, Calendar } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";

export default function YouTubeFeed() {
  const feed = useYouTubeStore((s) => s.feed);
  const setFeed = useYouTubeStore((s) => s.setFeed);
  const appendFeed = useYouTubeStore((s) => s.appendFeed);
  const page = useYouTubeStore((s) => s.page);
  const limit = useYouTubeStore((s) => s.limit);
  const query = useYouTubeStore((s) => s.query);
  const category = useYouTubeStore((s) => s.category);
  const loading = useYouTubeStore((s) => s.loadingFeed);
  const setLoading = useYouTubeStore((s) => s.setLoadingFeed);
  // const total = useMuxYouTubeStore((s) => s.total); // Currently unused but may be needed later

  const handleFlagVideo = async (videoId: string) => {
    try {
      // Simple flag dialog - in a real app, you'd have a proper modal
      const reason = prompt("Please select a reason for flagging this video:\n1. spam\n2. inappropriate\n3. copyright\n4. other\n\nEnter the number or reason:");
      
      if (!reason) return;
      
      let flagReason = reason.toLowerCase();
      if (reason === '1') flagReason = 'spam';
      else if (reason === '2') flagReason = 'inappropriate';
      else if (reason === '3') flagReason = 'copyright';
      else if (reason === '4') flagReason = 'other';
      
      if (!['spam', 'inappropriate', 'copyright', 'other'].includes(flagReason)) {
        toast("Invalid reason. Please try again.");
        return;
      }
      
      const description = prompt("Additional details (optional):");
      
      await api.post(`/api/moderation/videos/${videoId}/flag`, {
        reason: flagReason,
        description: description || ''
      });
      
      toast("Video flagged successfully. Thank you for helping keep our platform safe.");
    } catch (error) {
      console.error("Failed to flag video:", error);
      toast("Failed to flag video. Please try again.");
    }
  };

  const parentRef = useRef<HTMLDivElement>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Load videos function
  const loadVideos = useCallback(async (pageNum: number, searchQuery: string, cat: string | null, reset: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const res = await api.get("/api/videos", { 
        params: { 
          page: pageNum, 
          limit, 
          q: searchQuery, 
          category: cat, 
          type: "long" 
        } 
      });
      
      if (reset) {
        setFeed(res.data.items, res.data.total, res.data.page);
      } else {
        appendFeed(res.data.items, res.data.total);
      }
      
      // Check if there are more videos to load
      setHasMore(res.data.items.length === limit && res.data.items.length + (reset ? 0 : feed.length) < res.data.total);
    } catch (error) {
      console.error("Failed to load videos:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, limit, setFeed, appendFeed, feed.length, setLoading]);

  // Debounced search
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      setFeed([], 0, 1); // Reset feed
      loadVideos(1, searchQuery, category, true);
    }, 500); // 500ms debounce
    
    setDebounceTimer(timer);
  }, [debounceTimer, category, setFeed, loadVideos]);

  // Initial load and search/category change
  useEffect(() => {
    debouncedSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category]);

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadVideos(page + 1, query, category);
    }
  }, [inView, hasMore, loading, page, query, category, loadVideos]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const rowVirtualizer = useVirtualizer({
    count: feed.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280,
    overscan: 6,
  });

  return (
    <div className="h-[60vh] overflow-auto" ref={parentRef}>
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
        {rowVirtualizer.getVirtualItems().map((vi) => {
          const item = feed[vi.index];
          return (
            <div
              key={item?._id ?? vi.key}
              className="absolute left-0 right-0 p-2"
              style={{ transform: `translateY(${vi.start}px)` }}
            >
              {!item ? (
                <Skeleton className="h-[260px] w-full" />
              ) : (
                <div className="rounded border p-2 hover:shadow-lg transition-shadow duration-200">
                  <div className="text-sm font-medium mb-2 line-clamp-2">{item.title}</div>
                  {item.playbackId ? (
                    <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                      <HoverPreview 
                        playbackId={item.playbackId}
                        title={item.title}
                        className="w-full h-full"
                        previewDelay={500}
                        previewDuration={3}
                      />
                    </div>
                  ) : (
                    <Skeleton className="h-[200px] w-full" />
                  )}
                  <div className="mt-2 text-xs text-gray-600">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{item.views || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 w-6 text-gray-500 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFlagVideo(item._id);
                        }}
                        title="Flag video"
                      >
                        <Flag className="w-3 h-3" />
                      </Button>
                    </div>
                    {item.category && (
                      <div className="mt-1">
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                          {item.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading videos...</p>
        </div>
      )}
      
      {/* Infinite scroll trigger */}
      {!loading && hasMore && (
        <div ref={loadMoreRef} className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading more videos...</p>
        </div>
      )}
      
      {/* End of results */}
      {!loading && !hasMore && feed.length > 0 && (
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">No more videos to load</p>
        </div>
      )}
      
      {/* No results */}
      {!loading && feed.length === 0 && (
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2.306" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
          <p className="text-gray-600 mb-4">
            {query ? `No videos match "${query}"` : "No videos available yet"}
          </p>
          {!query && (
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}