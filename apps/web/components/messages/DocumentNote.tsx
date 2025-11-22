import {
  Download,
  FileSpreadsheet,
  FileText,
  Presentation,
} from 'lucide-react';
import React from 'react';
import { MediaItem } from './MediaGridView';

function getFileExtension(url?: string) {
  if (!url) return '';
  //@ts-ignore
  const parts = url?.split('/')?.pop()?.split('?')[0].split('.');
  return parts && parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

function getFileName(url?: string, name?: string) {
  if (name) return name;
  if (!url) return 'Untitled Document';
  // Remove query params/hash fragments
  const lastSegment = url.split('/').pop() || '';
  //@ts-ignore
  const clean = lastSegment.split('?')[0].split('#')[0];
  return clean || 'Untitled Document';
}

function getFileInfo(type?: string, url?: string) {
  const ext = getFileExtension(url);
  let label = 'Document';
  let Icon = FileText;
  if (type) {
    if (type.includes('spreadsheet') || ['xls', 'xlsx', 'ods'].includes(ext)) {
      label = 'Spreadsheet';
      Icon = FileSpreadsheet;
    } else if (type.includes('presentation') || ['ppt', 'pptx', 'odp'].includes(ext)) {
      label = 'Presentation';
      Icon = Presentation;
    } else if (type.startsWith('application/pdf') || ext === 'pdf') {
      label = 'PDF';
      Icon = FileText;
    } else if (type.includes('document') || ['doc', 'docx', 'rtf', 'odt'].includes(ext)) {
      label = 'Word Document';
      Icon = FileText;
    } else if (type.includes('text/') || ext === 'txt') {
      label = 'Text File';
      Icon = FileText;
    }
  } else {
    if (['pdf'].includes(ext)) {
      label = 'PDF';
      Icon = FileText;
    } else if (['xls', 'xlsx', 'ods'].includes(ext)) {
      label = 'Spreadsheet';
      Icon = FileSpreadsheet;
    } else if (['ppt', 'pptx', 'odp'].includes(ext)) {
      label = 'Presentation';
      Icon = Presentation;
    } else if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) {
      label = 'Word Document';
      Icon = FileText;
    } else if (['txt'].includes(ext)) {
      label = 'Text File';
      Icon = FileText;
    }
  }
  return { label, Icon };
}

function formatBytes(bytes?: number) {
  if (!bytes) return '';
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
}


const DocumentNote: React.FC<{ data: MediaItem }> = ({ data }) => {
  const { label, Icon } = getFileInfo(data.type, data.url);
  const displayName = getFileName(data.url, data.name);

  return (
    <div className="flex items-center rounded-lg px-4 py-3 border w-full h-full text-foreground bg-background-accent">
        <Icon className="mr-3 text-foreground-accent" size={20} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{displayName}</div>
          <div className="text-xs truncate text-foreground-accent">
            {label} {data.sizeBytes ? '· ' + formatBytes(data.sizeBytes) : ''}
          </div>
        </div>
      <div onClick={(e) => { e.stopPropagation() }} className="ml-2 hover:scale-[1.1]">
        <a href={data.url} target="_blank" rel="noopener noreferrer" download>
          <Download size={20} className='text-foreground' />
        </a>
      </div>
    </div>
  );
};

export default DocumentNote;
