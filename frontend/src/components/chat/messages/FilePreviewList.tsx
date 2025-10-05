"use client";

import { AudioLines, FileIcon, FileTextIcon, ImageIcon, MailIcon, VideoIcon, X } from "lucide-react";
import Image from "next/image";

interface FilePreviewListProps {
  files: File[];
  onRemove?: (index: number) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(file: File) {
  const type = file.type;
  const name = file.name.toLowerCase();

  if (type.startsWith("image/")) return <ImageIcon className="text-blue-500" size={24} />;
  if (type.startsWith("video/")) return <VideoIcon className="text-purple-500" size={24} />;
  if (type.startsWith("audio/")) return <AudioLines className="text-amber-600" size={24} />;
  if (name.endsWith(".pdf")) return <FileTextIcon className="text-red-500" size={24} />;
  if (name.endsWith(".doc") || name.endsWith(".docx"))
    return <FileTextIcon className="text-sky-500" size={24} />;
  if (name.endsWith(".eml")) return <MailIcon className="text-green-500" size={24} />;

  return <FileIcon className="text-gray-500" size={24} />;
}

export default function FilePreviewList({ files, onRemove }: FilePreviewListProps) {

  if (!files.length) return null;


  return (
    <div className="flex gap-2 mt-4 w-full bg-gray-100 py-3 overflow-x-auto scrollbar-custom rounded-xl">
      {files.map((file) => {
        const originalIndex = files.indexOf(file);
        const objectUrl = URL.createObjectURL(file);
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const isAudio = file.type.startsWith("audio/");

        return (
          <div
            key={`${file.name}-${file.size}-${originalIndex}`}
            className="relative max-w-max flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl border hover:bg-gray-100 transition"
          >
            {onRemove && (
              <button
                type="button"
                aria-label="Remove file"
                onClick={() => onRemove(originalIndex)}
                className="cursor-pointer absolute -top-2 -right-2 p-1 bg-white border rounded-full shadow hover:bg-gray-50"
              >
                <X size={14} />
              </button>
            )}

            <div className="flex-shrink-0">
              {isImage ? (
                <Image
                  src={objectUrl}
                  alt={file.name}
                  className="w-16 h-16 min-w-16 rounded-lg object-cover"
                  width={200}
                  height={200}
                />
              ) : isVideo ? (
                <div className="relative w-16 h-16">
                  <video
                    src={objectUrl}
                    className="w-16 h-16 rounded-lg object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/40 rounded-full p-1">
                      <VideoIcon className="text-white" size={18} />
                    </div>
                  </div>
                </div>
              ) : isAudio ? (
                <div className="w-16 h-16 flex items-center justify-center bg-background-accent">
                  <AudioLines className="text-amber-600" size={24} />
                </div>
              ) : (
                <div className="w-16 h-16 flex items-center justify-center bg-background-accent">
                  {getFileIcon(file)}
                </div>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              {/* <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span> */}
              <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
            </div>
          </div>
        );
      })}

    </div>
  );
}
