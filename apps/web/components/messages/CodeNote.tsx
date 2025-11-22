import { Download, FileCode } from 'lucide-react';
import React from 'react';
import { MediaItem } from './MediaGridView';

function getFileExtension(url?: string) {
  if (!url) return '';
  const parts = url.split('/').pop()?.split('?')[0]?.split('.');
  return parts && parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

function getFileName(url?: string, name?: string) {
  if (name) return name;
  if (!url) return 'Source Code';
  const lastSegment = url.split('/').pop() || '';
  const clean = lastSegment?.split('?')[0]?.split('#')[0];
  return clean || 'Source Code';
}

function formatBytes(bytes?: number) {
  if (!bytes) return '';
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
}

const CodeNote: React.FC<{ data: MediaItem }> = ({ data }) => {
  const displayName = getFileName(data.url, data.name);
  const ext = getFileExtension(data.url).toUpperCase() || 'Code';

  return (
    <div className="flex items-center rounded-lg px-4 py-3 border w-full h-full text-foreground bg-background-accent">
        <FileCode className="mr-4 text-foreground-accent" size={32} />
        <div className="flex-1 min-w-0">
          <div className="truncate font-medium">{displayName}</div>
          <div className="text-xs truncate text-foreground-accent">
            {ext} {data.sizeBytes ? '· ' + formatBytes(data.sizeBytes) : ''}
          </div>
        </div>
      <div onClick={e => e.stopPropagation()} className="ml-2 hover:scale-[1.1]">
        <a href={data.url} target="_blank" rel="noopener noreferrer" download>
          <Download size={20} className="text-foreground" />
        </a>
      </div>
    </div>
  );
};

export default CodeNote;
