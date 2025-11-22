import { Download, File } from 'lucide-react';
import React from 'react';
import { MediaItem } from './MediaGridView';

function getFileExtension(url?: string) {
  if (!url) return '';
  //@ts-ignore
  const parts = url.split('/').pop()?.split('?')[0].split('.');
  return parts && parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

function getFileName(url?: string, name?: string) {
  if (name) return name;
  if (!url) return 'File';
  const lastSegment = url.split('/').pop() || '';
  const clean = lastSegment?.split('?')[0]?.split('#')[0];
  return clean || 'File';
}

function formatBytes(bytes?: number) {
  if (!bytes) return '';
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
}

const UnknownNote: React.FC<{ data: MediaItem }> = ({ data }) => {
  const displayName = getFileName(data.url, data.name);
  const ext = getFileExtension(data.url).toUpperCase() || 'File';

  return (
    <div className="flex items-center rounded-lg px-4 py-3 border w-full h-full text-foreground bg-background-accent">
      <File className="text-foreground-accent mr-3" size={20} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{displayName}</div>
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

export default UnknownNote;
