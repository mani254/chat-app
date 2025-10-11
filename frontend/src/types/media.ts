export interface MediaUploadProgress {
  fileId: string;
  file: File;
  progress: number; // 0-100
  status: "pending" | "uploading" | "completed" | "failed";
  error?: string;
  url?: string;
  mimeType?: string;
  size?: number;
}

export interface MediaUploadState {
  uploads: MediaUploadProgress[];
  totalProgress: number;
  completedCount: number;
  failedCount: number;
  isUploading: boolean;
}

export interface MediaItem {
  url: string;
  name?: string;
  type?: string; // mime type if available
  sizeBytes?: number;
}

export interface MediaPreviewItem extends MediaItem {
  id: string;
  isLoading?: boolean;
  uploadProgress?: MediaUploadProgress;
}
