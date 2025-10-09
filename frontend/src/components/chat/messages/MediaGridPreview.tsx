"use client";

import { cn } from "@/lib/utils";
import LoadMoreLoader from "@/src/components/loaders/LoadMoreLoader";
import { createMediaItemFromUrl } from "@/src/utils/fileExtraction";
import { VideoIcon } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { getFileIconByType, isAudio as isAudioUtil, isImage as isImageUtil, isVideo as isVideoUtil } from "./mediaUtils";

export type MediaItem = {
  url: string;
  name?: string;
  type?: string; // mime type if available
  sizeBytes?: number;
};

interface MediaGridPreviewProps {
  items: MediaItem[];
  onOpenViewer?: (startIndex: number) => void;
  className?: string;
}


function formatMoreCount(count: number) {
  return count > 0 ? `+${count} more` : "";
}

export default function MediaGridPreview({ items, onOpenViewer, className }: MediaGridPreviewProps) {
  items = items.map((item) => createMediaItemFromUrl(item.url))
  const firstFour = useMemo(() => items.slice(0, 4), [items]);
  const hasMore = items.length > 3; // show overlay tile when there are 4 or more items
  const moreCount = items.length - 3; // overlay on the 4th tile shows +N for all after the 3rd
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  // For ≤1: stacked/single preview, not grid
  if (items.length <= 1) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {items.map((m, idx) => {
          const img = isImageUtil(m.type, m.url);
          const vid = isVideoUtil(m.type, m.url);
          const aud = isAudioUtil(m.type, m.url);

          if (m.url) {
            console.log(m.type, m.url, img)
          }

          return (
            <button
              key={`${m.url}-${idx}`}
              className="group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
              onClick={() => onOpenViewer?.(idx)}
              aria-label={m.name || "open media"}
            >
              <div className="relative rounded-lg overflow-hidden w-64 border border-border bg-background-accent/40 transition-transform duration-200 ease-out hover:shadow-lg hover:scale-[1.01]">
                {img ? (
                  <Image
                    src={m.url}
                    alt={m.name || "media"}
                    width={1200}
                    height={800}
                    loading="lazy"
                    className="w-full object-cover"
                    onLoadStart={() => setLoadingIdx(idx)}
                    onLoadingComplete={() => setLoadingIdx((v) => (v === idx ? null : v))}
                  />
                ) : vid ? (
                  <div className="w-full flex items-center justify-center bg-background-accent">
                    <div className="absolute">
                      {getFileIconByType(m.type, m.name, 45)}
                    </div>
                    <video src={m.url} className="h-56 w-auto max-w-full object-cover" muted playsInline preload="metadata" />
                  </div>
                ) : aud ? (
                  <div className="p-4 flex items-center justify-center gap-2 bg-gray-200">
                    {getFileIconByType(m.type, m.name, 45)}
                    <audio src={m.url} controls className="w-full" />
                  </div>
                ) : (
                  <div className="p-4 text-sm flex items-center justify-center gap-2 text-muted-foreground">
                    {getFileIconByType(m.type, m.name, 45)}
                  </div>
                )}
                {loadingIdx === idx && (
                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                    <LoadMoreLoader />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // ≥2: grid of first 3, and 4th tile with overlay when applicable
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {firstFour.slice(0, 3).map((m, idx) => {
        const img = isImageUtil(m.type, m.url);
        const vid = isVideoUtil(m.type, m.url);
        const aud = isAudioUtil(m.type, m.url);

        return (
          <button
            key={`${m.url}-${idx}`}
            className="relative overflow-hidden rounded-lg border border-border bg-background transition-transform duration-200 ease-out hover:shadow-sm hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={() => onOpenViewer?.(idx)}
            aria-label={m.name || "open media"}
          >
            <div className="relative h-40 min-w-40 flex items-center justify-center">
              {img ? (
                <Image className="w-full h-full object-cover" src={m.url} alt={m.name || "media"} width={600} height={400} loading="lazy" />
              ) : vid ? (
                <div className="w-full h-full relative">
                  <video
                    src={m.url}
                    className="w-full h-full rounded-lg object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 rounded-full p-1.5 border border-white/20 shadow-sm">
                      <VideoIcon className="text-white" size={24} />
                    </div>
                  </div>
                </div>
              ) : aud ? (
                <div className="p-2 flex items-center justify-center text-muted-foreground">
                  {getFileIconByType(m.type, m.name, 45)}
                </div>
              ) : (
                <div className="p-2 flex items-center justify-center text-muted-foreground">
                  {getFileIconByType(m.type, m.name, 45)}
                </div>
              )}
            </div>
          </button>
        );
      })}

      {/* View more tile */}

      {hasMore && (
        <button
          className="relative w-full h-full cursor-pointer rounded-lg overflow-hidden border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-transform duration-200 ease-out hover:shadow-sm hover:scale-[1.01] bg-background"
          onClick={() => onOpenViewer?.(3)}
          aria-label={`open media viewer starting at item 4`}
        >
          <div className="absolute inset-0 bg-black/50" />
          <span className="relative z-10 text-white text-sm font-semibold">
            {formatMoreCount(moreCount)}
          </span>
        </button>
      )}
    </div>
  );
}


