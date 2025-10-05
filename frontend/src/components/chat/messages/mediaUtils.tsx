import { AudioLines, FileIcon, FileTextIcon, ImageIcon, MailIcon, VideoIcon } from "lucide-react";
import React from "react";

export function isImage(type?: string, url?: string) {
  if (type) return type.startsWith("image/");
  return !!url && /(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.avif)(\?.*)?$/i.test(url);
}

export function isVideo(type?: string, url?: string) {
  if (type) return type.startsWith("video/");
  return !!url && /(\.mp4|\.webm|\.ogg|\.mov)(\?.*)?$/i.test(url);
}

export function isAudio(type?: string, url?: string) {
  if (type) return type.startsWith("audio/");
  return !!url && /(\.mp3|\.wav|\.ogg|\.m4a)(\?.*)?$/i.test(url);
}

export function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileIconByType(type?: string, name?: string, size?: number): React.ReactNode {

  const lower = (name || "").toLowerCase();
  if (type?.startsWith("image/") || /(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.avif)$/i.test(lower)) {
    return <ImageIcon className="text-blue-500" size={size || 20} />;
  }
  if (type?.startsWith("video/") || /(\.mp4|\.webm|\.ogg|\.mov)$/i.test(lower)) {
    return <VideoIcon className="text-purple-500" size={size || 20} />;
  }
  if (type?.startsWith("audio/") || /(\.mp3|\.wav|\.ogg|\.m4a)$/i.test(lower)) {
    return <AudioLines className="text-amber-600" size={size || 20} />;
  }
  if (lower.endsWith(".pdf")) {
    return <FileTextIcon className="text-red-500" size={size || 20} />;
  }
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) {
    return <FileTextIcon className="text-sky-500" size={size || 20} />;
  }
  if (lower.endsWith(".eml")) {
    return <MailIcon className="text-green-500" size={size || 20} />;
  }
  return <FileIcon className="text-gray-500" size={size || 20} />;
}


