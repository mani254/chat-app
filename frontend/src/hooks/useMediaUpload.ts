import { MediaUploadProgress, MediaUploadState } from "@/src/types/media";
import { useCallback, useState } from "react";

export const useMediaUpload = () => {
  const [uploadState, setUploadState] = useState<MediaUploadState>({
    uploads: [],
    totalProgress: 0,
    completedCount: 0,
    failedCount: 0,
    isUploading: false,
  });

  const initializeUploads = useCallback((files: File[]) => {
    const uploads: MediaUploadProgress[] = files.map((file) => ({
      fileId: `${file.name}-${file.size}-${Date.now()}`,
      file,
      progress: 0,
      status: "pending",
    }));

    setUploadState({
      uploads,
      totalProgress: 0,
      completedCount: 0,
      failedCount: 0,
      isUploading: true,
    });

    return uploads;
  }, []);

  const updateUploadProgress = useCallback(
    (fileId: string, progress: number) => {
      setUploadState((prev) => {
        const updatedUploads = prev.uploads.map((upload) =>
          upload.fileId === fileId
            ? { ...upload, progress, status: "uploading" as const }
            : upload
        );

        const totalProgress =
          updatedUploads.reduce((sum, upload) => sum + upload.progress, 0) /
          updatedUploads.length;

        return {
          ...prev,
          uploads: updatedUploads,
          totalProgress,
        };
      });
    },
    []
  );

  const completeUpload = useCallback(
    (fileId: string, url: string, mimeType: string, size: number) => {
      setUploadState((prev) => {
        const updatedUploads = prev.uploads.map((upload) =>
          upload.fileId === fileId
            ? {
                ...upload,
                progress: 100,
                status: "completed" as const,
                url,
                mimeType,
                size,
              }
            : upload
        );

        const completedCount = updatedUploads.filter(
          (upload) => upload.status === "completed"
        ).length;
        const failedCount = updatedUploads.filter(
          (upload) => upload.status === "failed"
        ).length;
        const totalProgress =
          updatedUploads.reduce((sum, upload) => sum + upload.progress, 0) /
          updatedUploads.length;

        return {
          ...prev,
          uploads: updatedUploads,
          totalProgress,
          completedCount,
          failedCount,
          isUploading: completedCount + failedCount < updatedUploads.length,
        };
      });
    },
    []
  );

  const failUpload = useCallback((fileId: string, error: string) => {
    setUploadState((prev) => {
      const updatedUploads = prev.uploads.map((upload) =>
        upload.fileId === fileId
          ? { ...upload, status: "failed" as const, error }
          : upload
      );

      const completedCount = updatedUploads.filter(
        (upload) => upload.status === "completed"
      ).length;
      const failedCount = updatedUploads.filter(
        (upload) => upload.status === "failed"
      ).length;
      const totalProgress =
        updatedUploads.reduce((sum, upload) => sum + upload.progress, 0) /
        updatedUploads.length;

      return {
        ...prev,
        uploads: updatedUploads,
        totalProgress,
        completedCount,
        failedCount,
        isUploading: completedCount + failedCount < updatedUploads.length,
      };
    });
  }, []);

  const retryUpload = useCallback((fileId: string) => {
    setUploadState((prev) => {
      const updatedUploads = prev.uploads.map((upload) =>
        upload.fileId === fileId
          ? {
              ...upload,
              progress: 0,
              status: "pending" as const,
              error: undefined,
            }
          : upload
      );

      return {
        ...prev,
        uploads: updatedUploads,
        isUploading: true,
      };
    });
  }, []);

  const clearUploads = useCallback(() => {
    setUploadState({
      uploads: [],
      totalProgress: 0,
      completedCount: 0,
      failedCount: 0,
      isUploading: false,
    });
  }, []);

  return {
    uploadState,
    initializeUploads,
    updateUploadProgress,
    completeUpload,
    failUpload,
    retryUpload,
    clearUploads,
  };
};
