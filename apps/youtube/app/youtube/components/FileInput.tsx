"use client";

import { useRef } from "react";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";

const MAX_SIZE_MB = 128;
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = new Set(["video/mp4", "video/mov", "video/avi"]);
const ALLOWED_EXTENSIONS = new Set([".mp4", ".mov", ".avi"]);

interface Props {
  onFile: (file: File) => void;
}

export function FileInput({ onFile }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const handleChange = () => {
    const file = ref.current?.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.has(file.name.toLowerCase().slice(-4))) {
      toast(`Unsupported format. Allowed: MP4, MOV, AVI`);
      return;
    }
    if (file.size > MAX_BYTES) {
      toast(`File too large. Max ${MAX_SIZE_MB} MB`);
      return;
    }
    onFile(file);
  };

  return (
    <>
      <input ref={ref} type="file" accept="video/mp4,video/mov,video/avi" className="hidden" onChange={handleChange} />
      <Button onClick={() => ref.current?.click()}>Select Video</Button>
    </>
  );
}