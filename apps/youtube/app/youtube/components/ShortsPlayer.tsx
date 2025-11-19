"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown, Heart, MessageCircle, Share2, Volume2, VolumeX, Play } from "lucide-react";
// import { Button } from "@workspace/ui/components/button"; // Not currently used
import { toast } from "@workspace/ui/components/sonner";
import api from "@/lib/api";
import { useShortsStore } from "../stores/useShortsStore";

interface ShortsPlayerProps {
  video: {
    _id: string;
    title: string;
    description: string;
    playbackId: string;
    uploadedBy: string;
    likes?: number;
    comments?: number;
    views?: number;
  };
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onLike: (videoId: string) => void;
  onShare: (video: { title?: string; description?: string }) => void;
}

export default function ShortsPlayer({ video, onSwipeUp, onSwipeDown, onLike, onShare }: ShortsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes || 0);
  // const [showControls, setShowControls] = useState(false); // Not currently used
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const trackView = async (videoId: string) => {
    try {
      await api.post(`/api/videos/${videoId}/view`);
    } catch (error) {
      console.error("Failed to track view:", error);
    }
  };
  
  // Track view when video plays for 3+ seconds
  useEffect(() => {
    if (!videoRef.current || !isPlaying) return;
    
    const timer = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setHasViewed(true);
        trackView(video._id);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, video._id]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(error => {
        console.error("Play failed:", error);
        toast("Failed to play video");
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleLike = useCallback(() => {
    const newLikedState = !hasLiked;
    setHasLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    onLike(video._id);
    
    // Optimistic update to backend
    api.post(`/api/videos/${video._id}/like`, { liked: newLikedState }).catch(error => {
      console.error("Like update failed:", error);
      // Revert on failure
      setHasLiked(!newLikedState);
      setLikeCount(prev => !newLikedState ? prev + 1 : prev - 1);
    });
  }, [hasLiked, video._id, onLike]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: `${window.location.origin}/mux/shorts/${video._id}`,
      }).catch(() => {
        // User cancelled share
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/mux/shorts/${video._id}`)
        .then(() => toast("Link copied to clipboard"))
        .catch(() => toast("Failed to copy link"));
    }
    onShare(video);
  }, [video, onShare]);

  // Touch/swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setIsDragging(false);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.x || !touchStart.y) return;
    
    const touch = e.touches[0];
    if (touch) {
      // const deltaX = touch.clientX - touchStart.x; // Not currently used
      const deltaY = touch.clientY - touchStart.y;
      
      // If movement is significant, consider it a swipe
      if (Math.abs(deltaY) > 10) {
        setIsDragging(true);
      }
    }
  }, [touchStart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.x || !touchStart.y || !isDragging) return;
    
    const touch = e.changedTouches[0];
    if (touch) {
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      
      // Determine swipe direction
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          onSwipeDown();
        } else {
          onSwipeUp();
        }
      }
    }
    
    setIsDragging(false);
    setTouchStart({ x: 0, y: 0 });
  }, [touchStart, isDragging, onSwipeUp, onSwipeDown]);

  // Mouse wheel for desktop swipe simulation
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > 10) {
      if (e.deltaY > 0) {
        onSwipeDown();
      } else {
        onSwipeUp();
      }
    }
  }, [onSwipeUp, onSwipeDown]);

  // Progress tracking
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(currentProgress);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target === document.body) {
        switch (e.key.toLowerCase()) {
          case ' ':
            e.preventDefault();
            togglePlay();
            break;
          case 'm':
            toggleMute();
            break;
          case 'arrowup':
            onSwipeUp();
            break;
          case 'arrowdown':
            onSwipeDown();
            break;
          case 'l':
            handleLike();
            break;
          case 's':
            handleShare();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, onSwipeUp, onSwipeDown, handleLike, handleShare]);

  // Auto-play on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error("Auto-play failed:", error);
        setIsPlaying(false);
      });
    }
  }, [isPlaying, hasViewed]);

  return (
    <div 
      className="relative w-full h-full bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onClick={togglePlay}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={`https://stream.mux.com/${video.playbackId}.m3u8`}
        muted={isMuted}
        loop
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-50 rounded-full p-4">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-600 bg-opacity-50">
        <div 
          className="h-full bg-red-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Right Side Controls */}
        <div className="absolute right-4 bottom-20 flex flex-col gap-4">
          {/* Like Button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            className={`pointer-events-auto p-3 rounded-full ${hasLiked ? 'bg-red-500' : 'bg-gray-800'} bg-opacity-70 transition-all hover:scale-110`}
          >
            <Heart className={`w-6 h-6 ${hasLiked ? 'text-white fill-white' : 'text-white'}`} />
          </button>
          <div className="text-white text-center text-sm font-medium">{likeCount}</div>

          {/* Comment Button */}
          <button
            onClick={(e) => { e.stopPropagation(); toast("Comments coming soon!"); }}
            className="pointer-events-auto p-3 rounded-full bg-gray-800 bg-opacity-70 transition-all hover:scale-110"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
          <div className="text-white text-center text-sm font-medium">{video.comments || 0}</div>

          {/* Share Button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            className="pointer-events-auto p-3 rounded-full bg-gray-800 bg-opacity-70 transition-all hover:scale-110"
          >
            <Share2 className="w-6 h-6 text-white" />
          </button>

          {/* Mute Button */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
            className="pointer-events-auto p-3 rounded-full bg-gray-800 bg-opacity-70 transition-all hover:scale-110"
          >
            {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
          </button>
        </div>

        {/* Bottom Info */}
        <div className="absolute left-4 bottom-4 right-16 pointer-events-auto">
          <div className="bg-black bg-opacity-50 rounded-lg p-3 backdrop-blur-sm">
            <h3 className="text-white font-semibold text-sm mb-1">{video.title}</h3>
            <p className="text-gray-300 text-xs mb-2 line-clamp-2">{video.description}</p>
            <p className="text-gray-400 text-xs">{video.views || 0} views</p>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-4 flex gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); onSwipeDown(); }}
            className="pointer-events-auto p-2 rounded-full bg-gray-800 bg-opacity-70 text-white hover:bg-opacity-90"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onSwipeUp(); }}
            className="pointer-events-auto p-2 rounded-full bg-gray-800 bg-opacity-70 text-white hover:bg-opacity-90"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute top-4 right-4 text-white text-xs opacity-50 pointer-events-none">
        Space: Play/Pause • M: Mute • ↑↓: Navigate • L: Like • S: Share
      </div>
    </div>
  );
}