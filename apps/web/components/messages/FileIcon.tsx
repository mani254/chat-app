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
    return <ImageIcon style={{ color: 'hsl(var(--file-image))' }} size={size || 20} />;
  }

  // Videos
  if (isVideoType(url, type)) {
    return <VideoIcon style={{ color: 'hsl(var(--file-video))' }} size={size || 20} />;
  }

  // Audio
  if (isAudioType(url, type)) {
    return <AudioLines style={{ color: 'hsl(var(--file-audio))' }} size={size || 20} />;
  }

  // Documents: PDF
  if (isDocumentType(url, type)) {
    if (lower.endsWith('.pdf')) {
      return <FileTextIcon style={{ color: 'hsl(var(--file-document))' }} size={size || 20} />;
    }
    // Word documents
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
      return <FileTextIcon style={{ color: 'hsl(var(--primary-color))' }} size={size || 20} />;
    }
    // Text documents
    if (lower.endsWith('.txt') || lower.endsWith('.rtf') || lower.endsWith('.odt')) {
      return <FileTextIcon style={{ color: 'hsl(var(--foreground-accent))' }} size={size || 20} />;
    }
    // Spreadsheets
    if (lower.endsWith('.xls') || lower.endsWith('.xlsx') || lower.endsWith('.ods')) {
      return <FileSpreadsheetIcon style={{ color: 'hsl(var(--file-email))' }} size={size || 20} />;
    }
    // Presentations
    if (lower.endsWith('.ppt') || lower.endsWith('.pptx') || lower.endsWith('.odp')) {
      return <PresentationIcon style={{ color: 'hsl(var(--file-archive))' }} size={size || 20} />;
    }
    // Fallback document
    return <FileTextIcon style={{ color: 'hsl(var(--foreground-accent))' }} size={size || 20} />;
  }

  // Archives
  if (isArchiveType(url, type)) {
    return <ArchiveIcon style={{ color: 'hsl(var(--file-archive))' }} size={size || 20} />;
  }

  // Code files
  if (isCodeFileType(url, type)) {
    return <CodeIcon style={{ color: 'hsl(var(--file-code))' }} size={size || 20} />;
  }

  // Email
  if (lower.endsWith(".eml")) {
    return <MailIcon style={{ color: 'hsl(var(--file-email))' }} size={size || 20} />;
  }

  // Default - generic file
  return <FileIcon style={{ color: 'hsl(var(--file-default))' }} size={size || 20} />;
}