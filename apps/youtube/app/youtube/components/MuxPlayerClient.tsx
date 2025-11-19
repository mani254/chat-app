"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useEffect, useRef } from "react";

export default function MuxPlayerClient({ playbackId }: { playbackId: string }) {
  const ref = useRef<HTMLVideoElement & { currentTime?: number }>(null);
  const key = `mux-time-${playbackId}`;

  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved && ref.current) {
      try {
        ref.current.currentTime = parseFloat(saved);
      } catch {
        // Ignore parsing errors
      }
    }
  }, [key]);

  return (
    <MuxPlayer
      ref={ref as any}
      playbackId={playbackId}
      muted={false}
      autoPlay={false}
      loop={false}
      accentColor="#ac39f2"
      onTimeUpdate={(e: CustomEvent<{ composed: true; detail: any }>) => {
        const t = (e.target as HTMLVideoElement)?.currentTime ?? ref.current?.currentTime;
        if (typeof t === "number") localStorage.setItem(key, String(t));
      }}
    />
  );
}