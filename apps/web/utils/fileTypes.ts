import {
  ImageIcon,
  VideoIcon,
  AudioLines,
  FileTextIcon,
  FileSpreadsheetIcon,
  PresentationIcon,
  ArchiveIcon,
  CodeIcon,
  MailIcon,
  FileIcon
} from 'lucide-react';

export function isImageType(url?: string, type?: string): boolean {
  if (type) return type.startsWith('image/');
  if (!url) return false;

  const cleanUrl = String(url)
    .trim()
    .replace(/[\r\n\u200B\uFEFF]/g, '');
  return /\.(png|jpe?g|gif|webp|avif|bmp|tiff|svg)([\?#].*)?$/i.test(cleanUrl);
}

export function isVideoType(url?: string, type?: string): boolean {
  if (type) return type.startsWith('video/');
  if (!url) return false;
  return /(\.mp4|\.webm|\.ogg|\.mov|\.avi|\.mkv|\.flv|\.wmv)(\?.*)?$/i.test(url);
}

export function isAudioType(url?: string, type?: string): boolean {
  if (type) return type.startsWith('audio/');
  if (!url) return false;
  return /(\.mp3|\.wav|\.ogg|\.m4a|\.aac|\.flac|\.wma)(\?.*)?$/i.test(url);
}

export function isDocumentType(url?: string, type?: string): boolean {
  if (type) {
    return (
      type.startsWith('application/pdf') ||
      type.includes('document') ||
      type.includes('text/') ||
      type.includes('spreadsheet') ||
      type.includes('presentation')
    );
  }
  if (!url) return false;
  const lower = url.toLowerCase();
  return /(\.pdf|\.doc|\.docx|\.txt|\.rtf|\.odt|\.xls|\.xlsx|\.ppt|\.pptx|\.odp|\.ods)([\?#].*)?$/i.test(lower);
}

export function isArchiveType(url?: string, type?: string): boolean {
  if (type) {
    return (
      type.includes('zip') || type.includes('rar') || type.includes('7z') || type.includes('tar') || type.includes('gz')
    );
  }
  if (!url) return false;
  const lower = url.toLowerCase();
  return /(\.zip|\.rar|\.7z|\.tar|\.gz|\.bz2)(\?.*)?$/i.test(lower);
}

export function isCodeFileType(url?: string, type?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return /(\.js|\.ts|\.jsx|\.tsx|\.py|\.java|\.cpp|\.c|\.cs|\.php|\.rb|\.go|\.rs|\.swift|\.kt|\.html|\.css|\.scss|\.sass|\.less|\.json|\.xml|\.yaml|\.yml)(\?.*)?$/i.test(
    lower,
  );
}

export function getFileCategory(
  url?: string,
  type?: string,
): 'image' | 'video' | 'audio' | 'document' | 'archive' | 'code' | 'other' {
  if (isImageType(url, type)) return 'image';
  if (isVideoType(url, type)) return 'video';
  if (isAudioType(url, type)) return 'audio';
  if (isDocumentType(url, type)) return 'document';
  if (isArchiveType(url, type)) return 'archive';
  if (isCodeFileType(url, type)) return 'code';
  return 'other';
}

export function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null) return '';
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function getDocumentPreviewUrl(url: string, type?: string, name?: string): string | null {
  if (!isDocumentType(url, type)) return null;

  // Extract filename from URL if provided, otherwise use name parameter
  const fileName = url ? url.split('/').pop() : name || 'filename';
  const lower = fileName?.toLowerCase() || '';

  // Office documents - use Microsoft Office Online
  if (
    lower.endsWith('.doc') ||
    lower.endsWith('.docx') ||
    lower.endsWith('.xls') ||
    lower.endsWith('.xlsx') ||
    lower.endsWith('.ppt') ||
    lower.endsWith('.pptx')
  ) {
    const previewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    console.log('Office document preview URL:', previewUrl);
    return previewUrl;
  }

  // PDF - use Google Docs viewer
  if (lower.endsWith('.pdf')) {
    const previewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    console.log('PDF preview URL:', previewUrl);
    return previewUrl;
  }

  // Text files - try to load directly
  if (lower.endsWith('.txt') || lower.endsWith('.rtf')) {
    console.log('Text file, using direct URL:', url);
    return url;
  }

  console.log('No preview URL found for:', lower);
  return null;
}

