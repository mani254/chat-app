"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoadMoreLoader from "@/src/components/loaders/LoadMoreLoader";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { formatBytes, getFileIconByType, isAudio as isAudioUtil, isImage as isImageUtil, isVideo as isVideoUtil } from "./mediaUtils";

export type ViewerItem = {
  url: string;
  name?: string;
  type?: string;
  sizeBytes?: number;
};

interface MediaViewerDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: ViewerItem[];
  currentIndex: number;
  onNavigate: (nextIndex: number) => void;
}

// remove local helpers in favor of mediaUtils imports

export default function MediaViewerDialog({ open, onOpenChange, items, currentIndex, onNavigate }: MediaViewerDialogProps) {
  const item = items[currentIndex];
  const [loading, setLoading] = useState(true);

  const goPrev = useCallback(() => {
    if (items.length === 0) return;
    onNavigate((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items, onNavigate]);

  const goNext = useCallback(() => {
    if (items.length === 0) return;
    onNavigate((currentIndex + 1) % items.length);
  }, [currentIndex, items, onNavigate]);

  // keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, goPrev, goNext, onOpenChange]);

  if (!item) return null;

  const isImg = isImageUtil(item.type, item.url);
  const isVid = isVideoUtil(item.type, item.url);
  const isAud = isAudioUtil(item.type, item.url);

  // Simple file-type aware preview for office docs to avoid auto-download
  const isOfficeDoc = (() => {
    const name = item.name || item.url;
    const lower = name.toLowerCase();
    const officeExts = [".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"];
    return officeExts.some((ext) => lower.endsWith(ext));
  })();

  const previewNode = (
    <div className="flex-1 bg-background flex items-center justify-center min-h-[480px] relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadMoreLoader />
        </div>
      )}
      {isImg ? (
        <Image
          src={item.url}
          alt={item.name || "media"}
          width={1600}
          height={1200}
          loading="lazy"
          className="max-h-[70vh] w-auto object-contain"
          onLoadStart={() => setLoading(true)}
          onLoadingComplete={() => setLoading(false)}
        />
      ) : isVid ? (
        <video
          src={item.url}
          controls
          className="max-h-[70vh] w-full"
          onLoadedData={() => setLoading(false)}
          preload="metadata"
        />
      ) : isAud ? (
        <div className="p-6 w-full">
          <audio src={item.url} controls className="w-full" onLoadedData={() => setLoading(false)} />
        </div>
      ) : isOfficeDoc ? (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(item.url)}`}
          className="w-full h-[70vh]"
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      ) : (
        <iframe
          src={item.url}
          className="w-full h-[70vh]"
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden min-h-[520px] bg-background" showCloseButton>
        <DialogHeader className="px-4 pt-4 pb-2 border-b">
          <DialogTitle className="text-sm font-medium flex items-center gap-2 truncate">
            {getFileIconByType(item.type, item.name)}
            <span className="truncate">{item.name || item.url}</span>
            <span className="ml-auto text-xs text-foreground-accent">{formatBytes(item.sizeBytes)}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {previewNode}
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-t">
            <div className="flex items-center gap-2 text-xs text-foreground-accent">
              <span>{item.type || ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded-md border text-sm" onClick={goPrev}>Previous</button>
              <button className="px-3 py-1 rounded-md border text-sm" onClick={goNext}>Next</button>
              <a className="px-3 py-1 rounded-md border text-sm" href={item.url} download target="_blank" rel="noreferrer">Download</a>
              <a className="px-3 py-1 rounded-md bg-primary text-white text-sm" href={item.url} target="_blank" rel="noreferrer">Open</a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


