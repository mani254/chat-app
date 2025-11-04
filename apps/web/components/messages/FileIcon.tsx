import { isArchiveType, isAudioType, isCodeFileType, isDocumentType, isImageType, isVideoType } from "@/utils/fileTypes";
import { ArchiveIcon, AudioLines, CodeIcon, FileIcon, FileSpreadsheetIcon, FileTextIcon, ImageIcon, MailIcon, PresentationIcon, VideoIcon } from "lucide-react";

export function getFileIconByType(
  url?: string,
  type?: string,
  name?: string,
  size?: number
): React.ReactNode {
  // Use either explicit name or last path from url
  const fileName = url ? url.split('/').pop() || "" : (name || "");
  const lower = fileName.toLowerCase();

  // Images
  if (isImageType(url, type)) {
    return <ImageIcon className="text-blue-500" size={size || 20} />;
  }

  // Videos
  if (isVideoType(url, type)) {
    return <VideoIcon className="text-purple-500" size={size || 20} />;
  }

  // Audio
  if (isAudioType(url, type)) {
    return <AudioLines className="text-amber-600" size={size || 20} />;
  }

  // Documents: PDF
  if (isDocumentType(url, type)) {
    if (lower.endsWith('.pdf')) {
      return <FileTextIcon className="text-red-500" size={size || 20} />;
    }
    // Word documents
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
      return <FileTextIcon className="text-blue-600" size={size || 20} />;
    }
    // Text documents
    if (lower.endsWith('.txt') || lower.endsWith('.rtf') || lower.endsWith('.odt')) {
      return <FileTextIcon className="text-gray-600" size={size || 20} />;
    }
    // Spreadsheets
    if (lower.endsWith('.xls') || lower.endsWith('.xlsx') || lower.endsWith('.ods')) {
      return <FileSpreadsheetIcon className="text-green-500" size={size || 20} />;
    }
    // Presentations
    if (lower.endsWith('.ppt') || lower.endsWith('.pptx') || lower.endsWith('.odp')) {
      return <PresentationIcon className="text-orange-500" size={size || 20} />;
    }
    // Fallback document
    return <FileTextIcon className="text-gray-600" size={size || 20} />;
  }

  // Archives
  if (isArchiveType(url, type)) {
    return <ArchiveIcon className="text-yellow-600" size={size || 20} />;
  }

  // Code files
  if (isCodeFileType(url, type)) {
    return <CodeIcon className="text-indigo-500" size={size || 20} />;
  }

  // Email
  if (lower.endsWith(".eml")) {
    return <MailIcon className="text-green-500" size={size || 20} />;
  }

  // Default - generic file
  return <FileIcon className="text-gray-500" size={size || 20} />;
}