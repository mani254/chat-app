"use client";

import MuxPlayer from "@mux/mux-player-react";
import { Play, VolumeX } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface HoverPreviewProps {
  playbackId: string;
  title: string;
  className?: string;
  previewDelay?: number; // milliseconds before preview starts
  previewDuration?: number; // maximum preview duration in seconds
}

export default function HoverPreview({
  playbackId,
  title,
  className = "",
  previewDelay = 800, // 800ms delay before preview
  previewDuration = 5 // 5 second preview max
}: HoverPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  // const [hasStarted, setHasStarted] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<HTMLVideoElement>(null);

  // Handle mouse enter
  const handleMouseEnter = () => {
    setIsHovered(true);

    // Clear any existing timeouts
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    // Start preview after delay
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPreview(true);
      // setHasStarted(true);

      // Stop preview after duration
      previewTimeoutRef.current = setTimeout(() => {
        setShowPreview(false);
      }, previewDuration * 1000);
    }, previewDelay);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowPreview(false);

    // Clear all timeouts
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail/Static Image */}
      <div className={`w-full h-full ${showPreview ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        <Image
          src={`https://image.mux.com/${playbackId}/thumbnail.jpg?time=2&width=640&height=360`}
          alt={title}
          className="w-full h-full object-cover rounded"
          width={640}
          height={360}
          priority={false}
        />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-50 rounded-full p-3">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Hover Preview Video */}
      {showPreview && (
        <div className="absolute inset-0 z-10">
          <MuxPlayer
            ref={playerRef as any}
            playbackId={playbackId}
            muted={true}
            autoPlay={true}
            loop={false}
            preload="auto"
            className="w-full h-full object-cover rounded"
            style={{
              aspectRatio: '16/9',
              transition: 'opacity 0.3s ease-in-out'
            }}
            startTime={0}
            // maxTime={previewDuration}
            onEnded={() => {
              setShowPreview(false);
              if (previewTimeoutRef.current) {
                clearTimeout(previewTimeoutRef.current);
              }
            }}
          />

          {/* Preview indicator */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <VolumeX className="w-3 h-3" />
            Preview
          </div>

          {/* Progress indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600 bg-opacity-50">
            <div
              className="h-full bg-red-500 transition-all duration-1000"
              style={{
                width: showPreview ? '100%' : '0%',
                transition: `width ${previewDuration}s linear`
              }}
            />
          </div>
        </div>
      )}

      {/* Hover overlay for desktop */}
      {isHovered && !showPreview && (
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded transition-opacity duration-300" />
      )}
    </div>
  );
}