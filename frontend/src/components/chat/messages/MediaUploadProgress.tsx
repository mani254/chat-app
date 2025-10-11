"use client";

import { Button } from "@/components/ui/button";
import { MediaUploadProgress } from "@/src/types/media";
// import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  AudioLines,
  CheckCircle2,
  FileIcon,
  FileTextIcon,
  ImageIcon,
  Loader2,
  RefreshCw,
  VideoIcon,
  XCircle
} from "lucide-react";
import { formatBytes } from "./mediaUtils";

interface MediaUploadProgressItemProps {
  upload: MediaUploadProgress;
  onRetry: (fileId: string) => void;
}

const MediaUploadProgressItem = ({ upload, onRetry }: MediaUploadProgressItemProps) => {
  const getFileIcon = () => {
    const { file } = upload;
    const type = file.type;
    const name = file.name.toLowerCase();

    if (type.startsWith("image/") || /\.(png|jpe?g|gif|webp|avif)$/i.test(name)) {
      return <ImageIcon className="w-4 h-4 text-blue-500" />;
    }
    if (type.startsWith("video/") || /\.(mp4|webm|ogg|mov)$/i.test(name)) {
      return <VideoIcon className="w-4 h-4 text-purple-500" />;
    }
    if (type.startsWith("audio/") || /\.(mp3|wav|ogg|m4a)$/i.test(name)) {
      return <AudioLines className="w-4 h-4 text-amber-600" />;
    }
    if (name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx")) {
      return <FileTextIcon className="w-4 h-4 text-red-500" />;
    }
    return <FileIcon className="w-4 h-4 text-gray-500" />;
  };

  const getStatusIcon = () => {
    switch (upload.status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-background-accent/50 rounded-lg border border-border">
      <div className="flex-shrink-0">
        {getFileIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium truncate max-w-[200px]">
            {upload.file.name}
          </p>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {upload.status === 'failed' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRetry(upload.fileId)}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{formatBytes(upload.file.size)}</span>
          <span>{upload.progress.toFixed(0)}%</span>
        </div>

        <div className="w-full bg-background-accent rounded-full h-1">
          <div
            className="bg-primary h-1 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${upload.progress}%` }}
          />
        </div>

        {upload.error && (
          <p className="text-xs text-red-500 mt-1 truncate">
            {upload.error}
          </p>
        )}
      </div>
    </div>
  );
};

interface MediaUploadProgressListProps {
  uploads: MediaUploadProgress[];
  onRetry: (fileId: string) => void;
  className?: string;
}

export const MediaUploadProgressList = ({
  uploads,
  onRetry,
  className
}: MediaUploadProgressListProps) => {
  if (uploads.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {uploads.map((upload) => (
        <MediaUploadProgressItem
          key={upload.fileId}
          upload={upload}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
};

interface MediaUploadSummaryProps {
  totalFiles: number;
  completedCount: number;
  failedCount: number;
  totalProgress: number;
  isUploading: boolean;
}

export const MediaUploadSummary = ({
  totalFiles,
  completedCount,
  failedCount,
  totalProgress,
  isUploading,
}: MediaUploadSummaryProps) => {
  const pendingCount = totalFiles - completedCount - failedCount;

  return (
    <div className="flex items-center justify-between p-3 bg-background-accent/30 rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm">
          <span className="text-green-500">{completedCount}</span>
          <span className="text-muted-foreground">uploaded</span>
        </div>
        {failedCount > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-red-500">{failedCount}</span>
            <span className="text-muted-foreground">failed</span>
          </div>
        )}
        {pendingCount > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-blue-500">{pendingCount}</span>
            <span className="text-muted-foreground">pending</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {totalProgress.toFixed(0)}%
        </span>
        {isUploading && (
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
        )}
      </div>
    </div>
  );
};
