import { isArchiveType, isAudioType, isCodeFileType, isDocumentType, isImageType, isVideoType } from '@/utils/fileTypes';
import { cn } from '@workspace/ui/lib/utils';
import Image from 'next/image';
import React, { useState } from 'react';
import ArchiveNote from './ArchiveNote';
import AudioNote from './AudioNote';
import CodeNote from './CodeNote';
import DocumentNote from './DocumentNote';
import MediaViewerDialog from './MediaViewerDilog';
import UnknownNote from './UnknownNote';
import VideoNote from './VideoNote';

export interface MediaItem {
  url: string;
  name?: string;
  type?: string;
  sizeBytes?: number;
}

interface MediaGridViewProps {
  items: MediaItem[];
}

interface MediaItemProps {
  data: MediaItem;
  onClick?: () => void;
  className?: string;
  containerClassName?: string;
}

const MediaItem: React.FC<MediaItemProps> = ({
  data,
  onClick,
  className,
  containerClassName
}) => {

  const isImage = isImageType(data.url, data.type)
  const isVideo = isVideoType(data.url, data.type)
  const isAudio = isAudioType(data.url, data.type)
  const isDocument = isDocumentType(data.url, data.type)
  const isArchive = isArchiveType(data.url, data.type)
  const isCodeFile = isCodeFileType(data.url, data.type)

  if (isImage) {
    return (
      <div className={cn('relative w-full h-full rounded-lg overflow-hidden', containerClassName)}>
        <Image
          src={data.url}
          alt="media"
          width={500}
          height={500}
          className={cn("w-full h-full object-cover object-center rounded-lg cursor-pointer", className)}
          onClick={onClick}
        />
      </div>
    )
  }

  if (isAudio) {
    return <div className={cn('relative w-full h-full rounded-lg overflow-hidden', containerClassName)}>
      <AudioNote audioSrc={data.url} />
    </div>
  }

  if (isVideo) {
    return <div className={cn('relative w-full h-full rounded-lg overflow-hidden', containerClassName)}>
      <VideoNote videoSrc={data.url} />
    </div>
  }

  if (isDocument) {
    return <div className={cn('relative w-full h-full rounded-lg overflow-hidden', containerClassName)}>
      <DocumentNote data={data} />
    </div>
  }

  if (isArchive) {
    return <div className={cn('relative w-full h-full rounded-lg overflow-hidden', containerClassName)}>
      <ArchiveNote data={data} />
    </div>
  }

  if (isCodeFile) {
    return <div className={cn('relative w-full h-full rounded-lg overflow-hidden', containerClassName)}>
      <CodeNote data={data} />
    </div>
  }

  return <div className={cn('relative w-full h-full rounded-lg overflow-hidden', containerClassName)}>
    <UnknownNote data={data} />
  </div>

};

const MediaGridView: React.FC<MediaGridViewProps> = ({
  items,
}) => {
  const count = items.length;

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0)


  const handleClick = (index: number) => {
    setViewerOpen(true)
    setViewerIndex(index)
  };

  // Helper render
  const renderSingle = () => (
    <MediaItem
      data={items[0]!}
      onClick={() => handleClick(0)}
    />
  );

  const renderTwo = () => (
    <div className="flex flex-col gap-2 w-full">
      {items.slice(0, 2).map((src, idx) => (
        <MediaItem
          key={idx}
          data={src}
          onClick={() => handleClick(idx)}
        />
      ))}
    </div>
  );

  const renderThree = () => (
    <div className="grid grid-cols-2 gap-2 w-full">
      <div className="col-span-2 grid grid-cols-2 gap-2">
        {items.slice(0, 2).map((src, idx) => (
          <MediaItem
            key={idx}
            data={src}
            onClick={() => handleClick(idx)}
            containerClassName="aspect-square"
          />
        ))}
      </div>
      <div className="col-span-2 grid grid-cols-1">
        <MediaItem
          data={items[2]!}
          onClick={() => handleClick(2)}
        />
      </div>
    </div>
  );

  const renderFour = () => (
    <div className="grid grid-cols-2 gap-2 w-full">
      {items.slice(0, 4).map((src, idx) => (
        <MediaItem
          key={idx}
          data={src}
          onClick={() => handleClick(idx)}
          containerClassName="aspect-square"
        />
      ))}
    </div>
  );

  const renderMoreThanFour = () => (
    <div className="grid grid-cols-2 gap-2 w-full">
      {items.slice(0, 3).map((src, idx) => (
        <MediaItem
          key={idx}
          data={src}
          onClick={() => handleClick(idx)}
          containerClassName="aspect-square"
        />
      ))}
      <div
        className="w-full aspect-square relative rounded-lg overflow-hidden"
        onClick={() => handleClick(3)}
      >
        <MediaItem
          data={items[3]!}
          className="opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold bg-black/40">
          +{count - 3}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {count === 1 && renderSingle()}
      {count === 2 && renderTwo()}
      {count === 3 && renderThree()}
      {count === 4 && renderFour()}
      {count > 4 && renderMoreThanFour()}
      <MediaViewerDialog
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        items={items}
        currentIndex={viewerIndex}
        onNavigate={setViewerIndex}
      />
    </div>
  );
};

export default MediaGridView;