import React from "react";

interface AudioNoteProps {
  audioSrc: string;
}

const AudioNote: React.FC<AudioNoteProps> = ({ audioSrc }) => (
  <div className="p-4 bg-white shadow-sm rounded-lg max w-full h-full flex items-center justify-center">
    <audio
      src={audioSrc}
      controls
      className="w-full"
    />
  </div>
);

export default AudioNote;


// import { Pause, Play } from "lucide-react";
// import React, { useEffect, useRef, useState } from "react";

// interface AudioNoteProps {
//   audioSrc: string;
// }

// const DEFAULT_BAR_COUNT = 50;
// const MIN_BAR_HEIGHT = 10;
// const MAX_BAR_HEIGHT = 36;

// const AudioNote: React.FC<AudioNoteProps> = ({ audioSrc }) => {
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const waveformRef = useRef<HTMLDivElement>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [barCount, setBarCount] = useState(DEFAULT_BAR_COUNT);

//   useEffect(() => {
//     const updateBarCount = () => {
//       if (waveformRef.current) {
//         const width = waveformRef.current.offsetWidth;
//         setBarCount(Math.floor(width / 5)); // bar (4px) + gap (1px)
//       }
//     };

//     const observer = new window.ResizeObserver(updateBarCount);
//     if (waveformRef.current) observer.observe(waveformRef.current);
//     updateBarCount();

//     return () => observer.disconnect();
//   }, []);

//   const [barHeights] = useState(
//     Array.from({ length: barCount }, () =>
//       Math.floor(Math.random() * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT + 1)) + MIN_BAR_HEIGHT
//     )
//   );

//   const formatTime = (time: number) =>
//     `${Math.floor(time / 60)}:${("0" + Math.floor(time % 60)).slice(-2)}`;

//   const handlePlayPause = () => {
//     if (!audioRef.current) return;
//     if (isPlaying) {
//       audioRef.current.pause();
//     } else {
//       audioRef.current.play();
//     }
//     setIsPlaying((prev) => !prev);
//   };

//   const handleTimeUpdate = () => {
//     if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
//   };
//   const handleLoadedMetadata = () => {
//     if (audioRef.current) setDuration(audioRef.current.duration);
//   };
//   const handleEnded = () => setIsPlaying(false);

//   const handleWaveformClick = (index: number) => {
//     if (!audioRef.current || duration === 0) return;
//     const newTime = (index / barCount) * duration;
//     audioRef.current.currentTime = newTime;
//     setCurrentTime(newTime);
//   };

//   const progressIndex = duration ? Math.floor((currentTime / duration) * barCount) : 0;

//   return (
//     <div className="flex items-center p-4 bg-gray-100 rounded-lg text-foreground w-full max-w-lg">
//       <button
//         className="focus:outline-none mr-3"
//         onClick={handlePlayPause}
//         aria-label={isPlaying ? "Pause" : "Play"}
//       >
//         {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//       </button>
//       <span className="mr-3 text-sm whitespace-nowrap font-mono min-w-[56px] text-gray-700">
//         {formatTime(currentTime)} / {duration ? formatTime(duration) : "--:--"}
//       </span>
//       <div
//         ref={waveformRef}
//         className="flex-1 flex items-center space-x-1 overflow-x-hidden min-w-0"
//         style={{ minHeight: `${MAX_BAR_HEIGHT + 2}px` }}
//       >
//         {Array.from({ length: barCount }).map((_, i) => (
//           <div
//             key={i}
//             className={`w-1.5 rounded cursor-pointer transition-colors duration-100 ${i <= progressIndex ? "bg-gray-500" : "bg-gray-300"
//               }`}
//             style={{
//               height: barHeights[i % barHeights.length] + "px",
//               minWidth: "6px",
//             }}
//             onClick={() => handleWaveformClick(i)}
//           />
//         ))}
//       </div>
//       <audio
//         src={audioSrc}
//         ref={audioRef}
//         onTimeUpdate={handleTimeUpdate}
//         onLoadedMetadata={handleLoadedMetadata}
//         onEnded={handleEnded}
//         className="hidden"
//       />
//     </div>
//   );
// };

// export default AudioNote;

// // Usage:
// // <AudioNote audioSrc="https://yoursite.com/audio.mp3" />
