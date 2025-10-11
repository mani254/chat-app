import {
  ArchiveIcon,
  AudioLines,
  CodeIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ImageIcon,
  MailIcon,
  PresentationIcon,
  VideoIcon
} from "lucide-react";
import React from "react";

export function isImage(type?: string, url?: string): boolean {
  if (type) return type.startsWith("image/");
  if (!url) return false;

  const cleanUrl = String(url).trim().replace(/[\r\n\u200B\uFEFF]/g, '');
  return /\.(png|jpe?g|gif|webp|avif|bmp|tiff|svg)([\?#].*)?$/i.test(cleanUrl);
}

export function isVideo(type?: string, url?: string): boolean {
  if (type) return type.startsWith("video/");
  if (!url) return false;
  return /(\.mp4|\.webm|\.ogg|\.mov|\.avi|\.mkv|\.flv|\.wmv)(\?.*)?$/i.test(url);
}

export function isAudio(type?: string, url?: string): boolean {
  if (type) return type.startsWith("audio/");
  if (!url) return false;
  return /(\.mp3|\.wav|\.ogg|\.m4a|\.aac|\.flac|\.wma)(\?.*)?$/i.test(url);
}

export function isDocument(type?: string, url?: string): boolean {
  if (type) {
    return type.startsWith("application/pdf") ||
      type.includes("document") ||
      type.includes("text/") ||
      type.includes("spreadsheet") ||
      type.includes("presentation");
  }
  if (!url) return false;
  const lower = url.toLowerCase();
  return /(\.pdf|\.doc|\.docx|\.txt|\.rtf|\.odt|\.xls|\.xlsx|\.ppt|\.pptx|\.odp|\.ods)([\?#].*)?$/i.test(lower);
}

export function isArchive(type?: string, url?: string): boolean {
  if (type) {
    return type.includes("zip") ||
      type.includes("rar") ||
      type.includes("7z") ||
      type.includes("tar") ||
      type.includes("gz");
  }
  if (!url) return false;
  const lower = url.toLowerCase();
  return /(\.zip|\.rar|\.7z|\.tar|\.gz|\.bz2)(\?.*)?$/i.test(lower);
}

export function isCodeFile(type?: string, url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return /(\.js|\.ts|\.jsx|\.tsx|\.py|\.java|\.cpp|\.c|\.cs|\.php|\.rb|\.go|\.rs|\.swift|\.kt|\.html|\.css|\.scss|\.sass|\.less|\.json|\.xml|\.yaml|\.yml)(\?.*)?$/i.test(lower);
}

export function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null) return "";
  if (bytes === 0) return "0 B";

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function getFileIconByType(url?: string, type?: string, name?: string, size?: number): React.ReactNode {
  // Extract filename from URL if provided, otherwise use name parameter
  const fileName = url ? url.split('/').pop() || "" : (name || "");
  const lower = fileName.toLowerCase();
  console.log('-----', url, type, name, size, '------')

  // Images - check URL first, then type
  if (url && /(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.avif|\.bmp|\.tiff|\.svg)([\?#].*)?$/i.test(url)) {
    return <ImageIcon className="text-blue-500" size={size || 20} />;
  }
  if (type?.startsWith("image/") || /(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.avif|\.bmp|\.tiff|\.svg)$/i.test(lower)) {
    return <ImageIcon className="text-blue-500" size={size || 20} />;
  }

  // Videos - check URL first, then type
  if (url && /(\.mp4|\.webm|\.ogg|\.mov|\.avi|\.mkv|\.flv|\.wmv)([\?#].*)?$/i.test(url)) {
    return <VideoIcon className="text-purple-500" size={size || 20} />;
  }
  if (type?.startsWith("video/") || /(\.mp4|\.webm|\.ogg|\.mov|\.avi|\.mkv|\.flv|\.wmv)$/i.test(lower)) {
    return <VideoIcon className="text-purple-500" size={size || 20} />;
  }

  // Audio - check URL first, then type
  if (url && /(\.mp3|\.wav|\.ogg|\.m4a|\.aac|\.flac|\.wma)([\?#].*)?$/i.test(url)) {
    return <AudioLines className="text-amber-600" size={size || 20} />;
  }
  if (type?.startsWith("audio/") || /(\.mp3|\.wav|\.ogg|\.m4a|\.aac|\.flac|\.wma)$/i.test(lower)) {
    return <AudioLines className="text-amber-600" size={size || 20} />;
  }

  // Documents - check URL first, then name
  if (url && /(\.pdf|\.doc|\.docx|\.txt|\.rtf|\.odt|\.xls|\.xlsx|\.ppt|\.pptx|\.odp|\.ods)([\?#].*)?$/i.test(url)) {
    if (url.toLowerCase().includes(".pdf")) {
      return <FileTextIcon className="text-red-500" size={size || 20} />;
    }
    if (url.toLowerCase().includes(".doc") || url.toLowerCase().includes(".docx")) {
      return <FileTextIcon className="text-blue-600" size={size || 20} />;
    }
    if (url.toLowerCase().includes(".txt") || url.toLowerCase().includes(".rtf") || url.toLowerCase().includes(".odt")) {
      return <FileTextIcon className="text-gray-600" size={size || 20} />;
    }
    if (url.toLowerCase().includes(".xls") || url.toLowerCase().includes(".xlsx") || url.toLowerCase().includes(".ods")) {
      return <FileSpreadsheetIcon className="text-green-500" size={size || 20} />;
    }
    if (url.toLowerCase().includes(".ppt") || url.toLowerCase().includes(".pptx") || url.toLowerCase().includes(".odp")) {
      return <PresentationIcon className="text-orange-500" size={size || 20} />;
    }
  }

  // Fallback to name-based detection
  if (lower.endsWith(".pdf")) {
    return <FileTextIcon className="text-red-500" size={size || 20} />;
  }
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) {
    return <FileTextIcon className="text-blue-600" size={size || 20} />;
  }
  if (lower.endsWith(".txt") || lower.endsWith(".rtf") || lower.endsWith(".odt")) {
    return <FileTextIcon className="text-gray-600" size={size || 20} />;
  }

  // Spreadsheets
  if (lower.endsWith(".xls") || lower.endsWith(".xlsx") || lower.endsWith(".ods")) {
    return <FileSpreadsheetIcon className="text-green-500" size={size || 20} />;
  }

  // Presentations
  if (lower.endsWith(".ppt") || lower.endsWith(".pptx") || lower.endsWith(".odp")) {
    return <PresentationIcon className="text-orange-500" size={size || 20} />;
  }

  // Archives - check URL first, then name
  if (url && /(\.zip|\.rar|\.7z|\.tar|\.gz|\.bz2)([\?#].*)?$/i.test(url)) {
    return <ArchiveIcon className="text-yellow-600" size={size || 20} />;
  }
  if (lower.endsWith(".zip") || lower.endsWith(".rar") || lower.endsWith(".7z") || lower.endsWith(".tar") || lower.endsWith(".gz")) {
    return <ArchiveIcon className="text-yellow-600" size={size || 20} />;
  }

  // Code files - check URL first, then name
  if (url && /(\.js|\.ts|\.jsx|\.tsx|\.py|\.java|\.cpp|\.c|\.cs|\.php|\.rb|\.go|\.rs|\.swift|\.kt|\.html|\.css|\.scss|\.sass|\.less|\.json|\.xml|\.yaml|\.yml)([\?#].*)?$/i.test(url)) {
    return <CodeIcon className="text-indigo-500" size={size || 20} />;
  }
  if (/(\.js|\.ts|\.jsx|\.tsx|\.py|\.java|\.cpp|\.c|\.cs|\.php|\.rb|\.go|\.rs|\.swift|\.kt|\.html|\.css|\.scss|\.sass|\.less|\.json|\.xml|\.yaml|\.yml)$/i.test(lower)) {
    return <CodeIcon className="text-indigo-500" size={size || 20} />;
  }

  // Email
  if (lower.endsWith(".eml")) {
    return <MailIcon className="text-green-500" size={size || 20} />;
  }

  // Default
  return <FileIcon className="text-gray-500" size={size || 20} />;
}

export function getFileCategory(type?: string, name?: string): 'image' | 'video' | 'audio' | 'document' | 'archive' | 'code' | 'other' {
  if (isImage(type, name)) return 'image';
  if (isVideo(type, name)) return 'video';
  if (isAudio(type, name)) return 'audio';
  if (isDocument(type, name)) return 'document';
  if (isArchive(type, name)) return 'archive';
  if (isCodeFile(type, name)) return 'code';
  return 'other';
}

export function canPreviewInBrowser(type?: string, name?: string): boolean {
  const category = getFileCategory(type, name);
  return category === 'image' || category === 'video' || category === 'audio';
}

export function getDocumentPreviewUrl(url: string, type?: string, name?: string): string | null {
  if (!isDocument(type, name)) return null;

  // Extract filename from URL if provided, otherwise use name parameter
  const fileName = url ? url.split('/').pop() || "" : (name || "");
  const lower = fileName.toLowerCase();

  console.log('getDocumentPreviewUrl Debug:', {
    url,
    type,
    name,
    fileName,
    lower,
    isDocument: isDocument(type, name)
  });

  // Office documents - use Microsoft Office Online
  if (lower.endsWith(".doc") || lower.endsWith(".docx") ||
    lower.endsWith(".xls") || lower.endsWith(".xlsx") ||
    lower.endsWith(".ppt") || lower.endsWith(".pptx")) {
    const previewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    console.log('Office document preview URL:', previewUrl);
    return previewUrl;
  }

  // PDF - use Google Docs viewer
  if (lower.endsWith(".pdf")) {
    const previewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    console.log('PDF preview URL:', previewUrl);
    return previewUrl;
  }

  // Text files - try to load directly
  if (lower.endsWith(".txt") || lower.endsWith(".rtf")) {
    console.log('Text file, using direct URL:', url);
    return url;
  }

  console.log('No preview URL found for:', lower);
  return null;
}