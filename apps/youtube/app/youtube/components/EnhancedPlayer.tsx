"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Settings, 
  Maximize, 
  Minimize,
  Rewind,
  FastForward,
  Flag
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";
import api from "@/lib/api";

interface EnhancedPlayerProps {
  playbackId: string;
  title?: string;
  videoId?: string;
  className?: string;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
}

// interface QualityLevel {
//   height: number;
//   width: number;
//   bitrate: number;
// }

export default function EnhancedPlayer({ 
  playbackId, 
  title, 
  videoId,
  className = "",
  onTimeUpdate,
  onEnded
}: EnhancedPlayerProps) {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState<string>('auto');
  // const [availableQualities, setAvailableQualities] = useState<QualityLevel[]>([]); // Will be used for quality selection
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const qualityOptions = ['auto', '1080p', '720p', '480p', '360p'];

  // Load saved preferences
  useEffect(() => {
    const savedRate = localStorage.getItem(`playback-rate-${playbackId}`);
    const savedQuality = localStorage.getItem(`playback-quality-${playbackId}`);
    const savedVolume = localStorage.getItem(`playback-volume`);
    
    if (savedRate) setPlaybackRate(parseFloat(savedRate));
    if (savedQuality) setQuality(savedQuality);
    if (savedVolume) setVolume(parseFloat(savedVolume));
  }, [playbackId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'arrowleft':
          skip(-10);
          break;
        case 'arrowright':
          skip(10);
          break;
        case 'arrowup':
          changeVolume(0.1);
          break;
        case 'arrowdown':
          changeVolume(-0.1);
          break;
        case 'j':
          skip(-10);
          break;
        case 'l':
          skip(10);
          break;
        case 'k':
          togglePlay();
          break;
        case 'c':
          // Toggle captions (if available)
          if (playerRef.current?.textTracks) {
            const tracks = playerRef.current.textTracks;
            for (let i = 0; i < tracks.length; i++) {
              const track = tracks[i];
              if (track && track.mode !== undefined) {
                track.mode = track.mode === 'showing' ? 'disabled' : 'showing';
              }
            }
          }
          break;
        case '0':
        case 'home':
          seekTo(0);
          break;
        case 'end':
          seekTo(duration);
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          seekTo(duration * (parseInt(e.key) / 10));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, duration]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setControlsTimeout(timeout);
    }
    
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [showControls, isPlaying, controlsTimeout]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play().catch((error: unknown) => {
        console.error("Play failed:", error);
        toast.error("Failed to play video");
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    
    const newMuted = !isMuted;
    playerRef.current.muted = newMuted;
    setIsMuted(newMuted);
    
    if (!newMuted && volume === 0) {
      setVolume(0.5);
    }
  }, [isMuted, volume]);

  const changeVolume = useCallback((delta: number) => {
    if (!playerRef.current) return;
    
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);
    playerRef.current.volume = newVolume;
    playerRef.current.muted = newVolume === 0;
    setIsMuted(newVolume === 0);
    
    localStorage.setItem('playback-volume', String(newVolume));
  }, [volume]);

  const skip = useCallback((seconds: number) => {
    if (!playerRef.current) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    playerRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [currentTime, duration]);

  const seekTo = useCallback((time: number) => {
    if (!playerRef.current) return;
    
    const newTime = Math.max(0, Math.min(duration, time));
    playerRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const changePlaybackRate = useCallback((rate: number) => {
    if (!playerRef.current) return;
    
    setPlaybackRate(rate);
    playerRef.current.playbackRate = rate;
    localStorage.setItem(`playback-rate-${playbackId}`, String(rate));
    toast.success(`Playback speed: ${rate}x`);
  }, [playbackId]);

  const changeQuality = useCallback((newQuality: string) => {
    setQuality(newQuality);
    localStorage.setItem(`playback-quality-${playbackId}`, newQuality);
    toast.success(`Quality: ${newQuality}`);
    
    // Note: Quality switching would require more complex implementation
    // with Mux's quality selection API
  }, [playbackId]);

  const toggleFullscreen = useCallback(() => {
    if (!playerRef.current) return;
    
    if (!isFullscreen) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      } else if ((playerRef.current as HTMLVideoElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
        (playerRef.current as HTMLVideoElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen?.();
      } else if ((playerRef.current as HTMLVideoElement & { mozRequestFullScreen?: () => void }).mozRequestFullScreen) {
        (playerRef.current as HTMLVideoElement & { mozRequestFullScreen?: () => void }).mozRequestFullScreen?.();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as Document & { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
        (document as Document & { webkitExitFullscreen?: () => void }).webkitExitFullscreen?.();
      } else if ((document as Document & { mozCancelFullScreen?: () => void }).mozCancelFullScreen) {
        (document as Document & { mozCancelFullScreen?: () => void }).mozCancelFullScreen?.();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleFlagVideo = useCallback(() => {
    if (!videoId) return;
    
    // Simple flag dialog - in a real app, you'd have a proper modal
    const reason = prompt("Please select a reason for flagging this video:\n1. spam\n2. inappropriate\n3. copyright\n4. other\n\nEnter the number or reason:");
    
    if (!reason) return;
    
    let flagReason = reason.toLowerCase();
    if (reason === '1') flagReason = 'spam';
    else if (reason === '2') flagReason = 'inappropriate';
    else if (reason === '3') flagReason = 'copyright';
    else if (reason === '4') flagReason = 'other';
    
    if (!['spam', 'inappropriate', 'copyright', 'other'].includes(flagReason)) {
      toast("Invalid reason. Please try again.");
      return;
    }
    
    const description = prompt("Additional details (optional):");
    
    api.post(`/api/moderation/videos/${videoId}/flag`, {
      reason: flagReason,
      description: description || ''
    }).then(() => {
      toast.success("Video flagged successfully. Thank you for helping keep our platform safe.");
    }).catch((error) => {
      console.error("Failed to flag video:", error);
      toast.error("Failed to flag video. Please try again.");
    });
  }, [videoId]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Player event handlers
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleTimeUpdate = (e: any) => {
    const video = e.target;
    if (video) {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    }
  };

  const handleLoadedMetadata = (e: any) => {
    const video = e.target;
    if (video) {
      setDuration(video.duration);
    }
  };

  const handleVolumeChange = (e: any) => {
    const video = e.target;
    if (video) {
      setVolume(video.volume);
      setIsMuted(video.muted);
    }
  };

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        muted={isMuted}
        autoPlay={false}
        loop={false}
        accentColor="#ac39f2"
        className="w-full h-full"
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onVolumeChange={handleVolumeChange}
        onEnded={onEnded}
      />

      {/* Custom Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
          {title && (
            <div className="text-white text-sm font-medium truncate">
              {title}
            </div>
          )}
          
          {/* Settings Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            {/* Settings Menu */}
            {showSettings && (
              <div className="absolute right-0 top-10 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-[200px] z-50">
                <div className="space-y-4">
                  {/* Playback Speed */}
                  <div>
                    <label className="text-white text-xs font-medium mb-2 block">Playback Speed</label>
                    <div className="grid grid-cols-4 gap-1">
                      {playbackRates.map(rate => (
                        <Button
                          key={rate}
                          variant={playbackRate === rate ? "default" : "ghost"}
                          size="sm"
                          className={`text-xs ${playbackRate === rate ? '' : 'text-white hover:bg-white/20'}`}
                          onClick={() => changePlaybackRate(rate)}
                        >
                          {rate}x
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Quality */}
                  <div>
                    <label className="text-white text-xs font-medium mb-2 block">Quality</label>
                    <div className="grid grid-cols-2 gap-1">
                      {qualityOptions.map(q => (
                        <Button
                          key={q}
                          variant={quality === q ? "default" : "ghost"}
                          size="sm"
                          className={`text-xs ${quality === q ? '' : 'text-white hover:bg-white/20'}`}
                          onClick={() => changeQuality(q)}
                        >
                          {q.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Play Button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <Button
              variant="ghost"
              size="lg"
              className="bg-black/50 hover:bg-black/70 text-white rounded-full p-6"
              onClick={togglePlay}
            >
              <Play className="w-12 h-12" />
            </Button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #ac39f2 0%, #ac39f2 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
              }}
            />
            <div className="flex justify-between text-white text-xs mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Skip Back */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => skip(-10)}
                title="Skip back 10s (←)"
              >
                <Rewind className="w-4 h-4" />
              </Button>
              
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={togglePlay}
                title="Play/Pause (Space/K)"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              {/* Skip Forward */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => skip(10)}
                title="Skip forward 10s (→/L)"
              >
                <FastForward className="w-4 h-4" />
              </Button>
              
              {/* Volume */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
                title="Mute/Unmute (M)"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              
              {/* Volume Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value);
                  setVolume(newVolume);
                  if (playerRef.current) {
                    playerRef.current.volume = newVolume;
                    playerRef.current.muted = newVolume === 0;
                    setIsMuted(newVolume === 0);
                    localStorage.setItem('playback-volume', String(newVolume));
                  }
                }}
                className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ac39f2 0%, #ac39f2 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`
                }}
              />
            </div>
            
            <div className="flex items-center gap-2">
              {/* Flag */}
              {videoId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={handleFlagVideo}
                  title="Flag video"
                >
                  <Flag className="w-4 h-4" />
                </Button>
              )}
              
              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
                title="Fullscreen (F)"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-xs opacity-50 pointer-events-none">
        Space: Play/Pause • M: Mute • ←→: Skip 10s • F: Fullscreen • C: Captions • 0-9: Seek
      </div>
    </div>
  );
}