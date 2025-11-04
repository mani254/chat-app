import { Play } from "lucide-react";
import React, { useRef, useState } from "react";

interface VideoNoteProps {
  videoSrc: string;
  alt?: string;
}

const VideoNote: React.FC<VideoNoteProps> = ({ videoSrc, alt = "Video Preview" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayRequest = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-black" onClick={(e) => { e.stopPropagation() }}>
      <video
        ref={videoRef}
        src={videoSrc}
        controls={isPlaying}
        autoPlay={false}
        muted
        className="w-full h-full object-cover object-center rounded-lg"
        tabIndex={-1}
        onPause={handlePause}
        onPlay={() => setIsPlaying(true)}
        style={{ pointerEvents: isPlaying ? "auto" : "none" }}
      />
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
          onClick={handlePlayRequest}
        >
          <Play size={64} className="text-white opacity-90" />
        </div>
      )}
    </div>
  );
};

export default VideoNote;
