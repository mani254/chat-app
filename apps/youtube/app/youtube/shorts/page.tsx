"use client";

import { useEffect, useCallback } from "react";
import { toast } from "@workspace/ui/components/sonner";
import ShortsPlayer from "../components/ShortsPlayer";
import { useShortsStore } from "../stores/useShortsStore";
import api from "@/lib/api";

export default function ShortsPage() {
  const { videos, currentIndex, setVideos, setCurrentIndex, loading, setLoading } = useShortsStore();
  // const [prefetchIndex, setPrefetchIndex] = useState(0); // Currently unused but may be needed later

  const loadShorts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/videos/shorts?page=1&limit=20");
      setVideos(response.data.items, response.data.total || response.data.items.length);
      toast(`Loaded ${response.data.items.length} shorts`);
    } catch (error) {
      console.error("Failed to load shorts:", error);
      toast("Failed to load shorts");
    } finally {
      setLoading(false);
    }
  }, [setLoading, setVideos]);

  // Fetch initial shorts
  useEffect(() => {
    loadShorts();
  }, [loadShorts]);

  const prefetchMoreShorts = useCallback(async () => {
    try {
      const nextPage = Math.floor(videos.length / 20) + 1;
      const response = await api.get(`/api/videos/shorts?page=${nextPage}&limit=20`);
      if (response.data.items.length > 0) {
        setVideos([...videos, ...response.data.items], response.data.total || (videos.length + response.data.items.length));
      }
    } catch (error) {
      console.error("Failed to prefetch shorts:", error);
    }
  }, [videos, setVideos]);

  // Prefetch next videos
  useEffect(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < videos.length && nextIndex >= videos.length - 3) {
      // Prefetch more videos when approaching the end
      prefetchMoreShorts();
    }
  }, [currentIndex, videos.length, prefetchMoreShorts]);

  const handleSwipeUp = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast("No more shorts available");
    }
  }, [currentIndex, videos.length, setCurrentIndex]);

  const handleSwipeDown = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex, setCurrentIndex]);

  const handleLike = useCallback((videoId: string) => {
    // Like functionality is handled within the player component
    console.log("Like video:", videoId);
  }, []);

  const handleShare = useCallback((video: { title?: string; description?: string }) => {
    console.log("Share video:", video);
    toast("Share functionality triggered");
  }, []);

  if (loading && videos.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading shorts...</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <p className="mb-4">No shorts available</p>
          <button 
            onClick={loadShorts}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];

  if (!currentVideo) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <p className="text-white">No videos available</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black overflow-hidden">
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-[360px] h-[640px] relative">
          {/* Current Video */}
          <div className="absolute inset-0">
            <ShortsPlayer
              video={currentVideo}
              onSwipeUp={handleSwipeUp}
              onSwipeDown={handleSwipeDown}
              onLike={handleLike}
              onShare={handleShare}
            />
          </div>

          {/* Loading indicator for next video */}
          {loading && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}

          {/* Video counter */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {currentIndex + 1} / {videos.length}
          </div>
        </div>
      </div>
    </div>
  );
}