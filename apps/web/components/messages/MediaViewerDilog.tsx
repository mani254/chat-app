"use client";

import { ChevronLeft, ChevronRight, Download, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { MediaItem } from "./MediaGridView";

import { formatBytes, getDocumentPreviewUrl, getFileCategory, isAudioType, isDocumentType, isImageType, isVideoType } from "@/utils/fileTypes";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import LoadMoreLoader from "../loaders/LoadMoreLoader";
import { getFileIconByType } from "./FileIcon";



interface MediaViewerDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: MediaItem[];
  currentIndex: number;
  onNavigate: (nextIndex: number) => void;
}

export default function MediaViewerDialog({ open, onOpenChange, items, currentIndex, onNavigate }: MediaViewerDialogProps) {
  const item = items[currentIndex];
  const [loading, setLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);
  const [iframeTimeout, setIframeTimeout] = useState<NodeJS.Timeout | null>(null);

  const goPrev = useCallback(() => {
    if (items.length === 0) return;
    onNavigate((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items, onNavigate]);

  const goNext = useCallback(() => {
    if (items.length === 0) return;
    onNavigate((currentIndex + 1) % items.length);
  }, [currentIndex, items, onNavigate]);


  // Reset states when item changes
  useEffect(() => {
    setLoading(true);
    setPreviewError(false);

    // Clear any existing timeout
    if (iframeTimeout) {
      clearTimeout(iframeTimeout);
      setIframeTimeout(null);
    }

    // Set a timeout for iframe loading (10 seconds)
    const timeout = setTimeout(() => {
      console.log('Iframe loading timeout reached');
      setPreviewError(true);
      setLoading(false);
    }, 10000);

    setIframeTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [currentIndex]);

  // Keyboard navigation
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

  const isImg = isImageType(item.url, item.type,);
  const isVid = isVideoType(item.url, item.type);
  const isAud = isAudioType(item.url, item.type);
  const isDoc = isDocumentType(item.url, item.type);
  const fileCategory = getFileCategory(item.url, item.type);


  const handlePreviewError = () => {
    console.log('Preview error occurred');
    setPreviewError(true);
    setLoading(false);
    if (iframeTimeout) {
      clearTimeout(iframeTimeout);
      setIframeTimeout(null);
    }
  };

  const handlePreviewLoad = () => {
    console.log('Preview loaded successfully');
    setLoading(false);
    if (iframeTimeout) {
      clearTimeout(iframeTimeout);
      setIframeTimeout(null);
    }
  };

  const renderPreview = () => {
    if (isImg) {
      return (
        <Image
          src={item.url}
          alt={item.name || "media"}
          width={1600}
          height={1200}
          loading="lazy"
          className="max-h-[70vh] w-auto object-contain"
          onLoadStart={() => setLoading(true)}
          onLoadingComplete={handlePreviewLoad}
          onError={handlePreviewError}
        />
      );
    }

    if (isVid) {
      return (
        <video
          src={item.url}
          controls
          className="max-h-[70vh] w-full"
          onLoadedData={handlePreviewLoad}
          onError={handlePreviewError}
          preload="metadata"
        />
      );
    }

    if (isAud) {
      return (
        <div className="p-6 w-full">
          <audio
            src={item.url}
            controls
            className="w-full"
            onLoadedData={handlePreviewLoad}
            onError={handlePreviewError}
          />
        </div>
      );
    }

    if (isDoc) {
      const previewUrl = getDocumentPreviewUrl(item.url, item.type, item.name);

      if (previewUrl && !previewError) {
        return (
          <iframe
            src={previewUrl}
            className="w-full h-[70vh] border-0"
            onLoad={handlePreviewLoad}
            onError={handlePreviewError}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title={`Preview of ${item.name || 'document'}`}
          />
        );
      }

      // Fallback for PDF files - try direct embedding
      if (item.url.toLowerCase().includes('.pdf')) {
        return (
          <iframe
            src={item.url}
            className="w-full h-[70vh] border-0"
            onLoad={handlePreviewLoad}
            onError={handlePreviewError}
            title={`Preview of ${item.name || 'PDF document'}`}
          />
        );
      }

      // Fallback for Office documents - try Google Docs viewer
      const fileName = item.url ? item.url.split('/').pop() || "" : (item.name || "");
      const lowerFileName = fileName.toLowerCase();
      if (lowerFileName.endsWith('.docx') || lowerFileName.endsWith('.doc') ||
        lowerFileName.endsWith('.xlsx') || lowerFileName.endsWith('.xls') ||
        lowerFileName.endsWith('.pptx') || lowerFileName.endsWith('.ppt')) {
        return (
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(item.url)}&embedded=true`}
            className="w-full h-[70vh] border-0"
            onLoad={handlePreviewLoad}
            onError={handlePreviewError}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title={`Preview of ${item.name || 'Office document'}`}
          />
        );
      }
    }

    // Fallback for unsupported files
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="p-4 rounded-full bg-background-accent">
          {getFileIconByType(item.url, item.type, item.name, 48)}
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">{item.name || 'Unknown File'}</h3>
          <p className="text-muted-foreground mb-4">
            This file type cannot be previewed in the browser.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" asChild>
              <a href={item.url} download target="_blank" rel="noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </Button>
            <Button asChild>
              <a href={item.url} target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl p-0 overflow-hidden min-h-[520px] bg-background" onClick={(e) => e.stopPropagation()}>
        <DialogHeader className="px-4 pt-4 pb-2 border-b">
          <DialogTitle className="text-sm font-medium flex items-center gap-2 truncate max-w-[250px]">
            {getFileIconByType(item.url, item.type, item.name)}
            <span className="truncate max-w-[250px]">{item.name || item.url}</span>
            {item.sizeBytes && (
              <span className="ml-auto text-xs text-foreground-accent">{formatBytes(item.sizeBytes)}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          <div className="flex-1 bg-background flex items-center justify-center min-h-[480px] relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <LoadMoreLoader />
              </div>
            )}
            {renderPreview()}
          </div>

          <div className="w-full border-t bg-background-accent/40">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-4 max-w-5xl mx-auto">

              {/* --- Left Section: File Info --- */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-sm text-foreground-accent w-full md:w-auto">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground capitalize">{fileCategory}</span>
                  {item.type && (
                    <>
                      <span className="text-foreground/40">•</span>
                      <span className="text-foreground/70">{item.type}</span>
                    </>
                  )}
                </div>

                {items.length > 1 && (
                  <div className="mt-1 sm:mt-0 text-xs text-foreground/60">
                    <span>{currentIndex + 1} of {items.length}</span>
                  </div>
                )}
              </div>

              {/* --- Right Section: Actions --- */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">

                {/* Navigation Controls */}
                {items.length > 1 && (
                  <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goPrev}
                      disabled={items.length <= 1}
                      className="flex items-center gap-1 rounded-md border-foreground/10 hover:border-foreground/30 transition-colors flex-1 sm:flex-none"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goNext}
                      disabled={items.length <= 1}
                      className="flex items-center gap-1 rounded-md border-foreground/10 hover:border-foreground/30 transition-colors flex-1 sm:flex-none"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* File Actions */}
                <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex items-center gap-1 rounded-md border-foreground/10 hover:border-foreground/30 transition-colors flex-1 sm:flex-none"
                  >
                    <a href={item.url} download target="_blank" rel="noreferrer">
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                  </Button>

                  <Button
                    size="sm"
                    asChild
                    className="flex items-center gap-1 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity flex-1 sm:flex-none"
                  >
                    <a href={item.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      <span className="hidden sm:inline">Open</span>
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}