"use client";

import { cn } from "@/lib/utils";
import LoadMoreLoader from "@/src/components/loaders/LoadMoreLoader";
import { MediaItem } from "@/src/types/media";
import { VideoIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { MediaSkeleton } from "./MediaSkeleton";
import {
  formatBytes,
  getFileIconByType,
  isAudio as isAudioUtil,
  isDocument,
  isImage as isImageUtil,
  isVideo as isVideoUtil
} from "./mediaUtils";

interface MediaGridPreviewProps {
  items: MediaItem[];
  onOpenViewer?: (startIndex: number) => void;
  className?: string;
  isLoading?: boolean;
}

export default function MediaGridPreview({ items, onOpenViewer, className, isLoading }: MediaGridPreviewProps) {
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);

  // Early returns
  if (isLoading) {
    return <MediaSkeleton count={items.length} className={className} />;
  }

  if (!items || items.length === 0) return null;

  const handleItemClick = (index: number) => {
    onOpenViewer?.(index);
  };

  const renderMediaItem = (item: MediaItem, index: number, isGridItem = false) => {
    console.log(item, '-----')
    const isImg = isImageUtil(item.type, item.url);
    const isVid = isVideoUtil(item.type, item.url);
    const isAud = isAudioUtil(item.type, item.url);
    const isDoc = isDocument(item.type, item.name);

    const getItemContent = () => {
      if (isImg) {
        return (
          <Image
            src={item.url}
            alt={item.name || "media"}
            width={isGridItem ? 600 : 1200}
            height={isGridItem ? 400 : 800}
            loading="lazy"
            className={cn(
              "object-cover",
              isGridItem ? "w-full h-full" : "min-w-[250px] w-full"
            )}
            onLoadStart={() => setLoadingIdx(index)}
            onLoadingComplete={() => setLoadingIdx((v) => (v === index ? null : v))}
          />
        );
      }

      if (isVid) {
        return (
          <div className={cn(
            "flex items-center justify-center bg-background-accent",
            isGridItem ? "w-full h-full relative" : "w-full"
          )}>
            {!isGridItem && (
              <div className="absolute z-10">
                {getFileIconByType(item.url, item.type, item.name, 45)}
              </div>
            )}
            <video
              src={item.url}
              className={cn(
                "object-cover",
                isGridItem ? "w-full h-full rounded-lg" : "h-56 w-auto max-w-full"
              )}
              muted
              playsInline
              preload="metadata"
            />
            {isGridItem && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 rounded-full p-1.5 border border-white/20 shadow-sm">
                  <VideoIcon className="text-white" size={24} />
                </div>
              </div>
            )}
          </div>
        );
      }

      if (isAud) {
        return (
          <div className={cn(
            "flex items-center justify-center gap-2 bg-gray-200",
            isGridItem ? "p-2 text-muted-foreground h-full" : "p-4"
          )}>
            {getFileIconByType(item.url, item.type, item.name, isGridItem ? 32 : 45)}
            {!isGridItem && <audio src={item.url} controls className="min-w-[200px]" />}
          </div>
        );
      }

      // Documents and other files
      return (
        <div className={cn(
          "flex flex-col items-center justify-center gap-2 text-muted-foreground",
          isDoc ? "bg-background-accent/50" : "bg-background-accent/30",
          isGridItem ? "p-2 h-full" : "p-4"
        )}>
          {getFileIconByType(item.url, item.type, item.name, isGridItem ? 32 : 45)}
          <div className="text-center w-full">
            <p className={cn(
              "font-medium truncate",
              isGridItem ? "text-xs" : "text-sm"
            )}>
              {item.name || "Unknown File"}
            </p>
            {!isGridItem && item.sizeBytes && (
              <p className="text-xs text-muted-foreground">{formatBytes(item.sizeBytes)}</p>
            )}
          </div>
        </div>
      );
    };

    return (
      <button
        key={`${item.url}-${index}`}
        className={cn(
          "group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg transition-transform duration-200 ease-out hover:shadow-lg hover:scale-[1.01]",
          isGridItem ? "overflow-hidden border border-border bg-background" : "w-full max-w-64 border border-border bg-background-accent/40"
        )}
        onClick={() => handleItemClick(index)}
        aria-label={item.name || "open media"}
      >
        <div className={cn(
          "relative rounded-lg overflow-hidden",
          isGridItem ? "h-40 min-w-40 flex items-center justify-center" : ""
        )}>
          {getItemContent()}

          {loadingIdx === index && (
            <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
              <LoadMoreLoader />
            </div>
          )}
        </div>
      </button>
    );
  };

  // Single item layout
  if (items.length === 1) {
    return (
      <div className={cn("flex flex-col gap-2 max-w-full", className)}>
        <div className="w-full max-w-64">
          {renderMediaItem(items[0], 0, false)}
        </div>
      </div>
    );
  }

  // Grid layout for multiple items
  const firstFour = items.slice(0, 4);
  const hasMore = items.length > 3;
  const moreCount = items.length - 3;

  return (
    <div className={cn("grid grid-cols-2 gap-2 max-w-full", className)}>
      {firstFour.slice(0, 3).map((item, idx) => (
        <div key={`${item.url}-${idx}`} className="min-w-0">
          {renderMediaItem(item, idx, true)}
        </div>
      ))}

      {/* View more tile */}
      {hasMore && (
        <div className="min-w-0">
          <button
            className="relative w-full h-40 cursor-pointer rounded-lg overflow-hidden border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-transform duration-200 ease-out hover:shadow-sm hover:scale-[1.01] bg-background flex items-center justify-center"
            onClick={() => handleItemClick(3)}
            aria-label={`open media viewer starting at item 4`}
          >
            <div className="absolute inset-0 bg-black/50" />
            <span className="relative z-10 text-white text-sm font-semibold">
              +{moreCount} more
            </span>
          </button>
        </div>
      )}
    </div>
  );
}