"use client";

import api from "@/lib/api";
import MuxUploader from "@mux/mux-uploader-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { toast } from "@workspace/ui/components/sonner";
import { useState } from "react";
import { useYouTubeStore } from "../stores/useYouTubeStore";
import { FileInput } from "./FileInput";

export default function Uploader() {
  const addUpload = useYouTubeStore((s) => s.addUpload);
  const updateUpload = useYouTubeStore((s) => s.updateUpload);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted" | "private">("private");
  const [type, setType] = useState<"long" | "short">("long");
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const initUpload = async () => {
    if (!selectedFile) {
      toast("Please select a video first");
      return;
    }

    try {
      const res = await api.post("/api/videos/uploads", {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type
      });
      setEndpoint(res.data.url);
      setUploadId(res.data.id);
    } catch (error: unknown) {
      console.error("Upload initialization failed:", error);
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to initialize upload";
      const details = (error as { response?: { data?: { details?: unknown } } })?.response?.data?.details;

      if (details) {
        toast(`${message}: ${JSON.stringify(details)}`);
      } else {
        toast(message);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <select className="border rounded px-2 py-1" value={visibility} onChange={(e) => setVisibility(e.target.value as "public" | "unlisted" | "private")}>
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
          <option value="private">Private</option>
        </select>
        <select className="border rounded px-2 py-1" value={type} onChange={(e) => setType(e.target.value as "long" | "short")}>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <FileInput onFile={setSelectedFile} />
        <Button onClick={initUpload}>Init Direct Upload</Button>
      </div>
      {selectedFile && <div className="text-sm text-gray-600">Selected: {selectedFile.name}</div>}

      {endpoint && (
        <MuxUploader
          endpoint={endpoint}
          onUploadStart={(evt) => {
            const detail = (evt as CustomEvent).detail ?? {};
            const file: File | undefined = detail.file as File ?? selectedFile;
            if (!file) return;
            const id = uploadId || file.name;
            addUpload({ id, fileName: file.name, size: file.size, progress: 0, status: "uploading" });
          }}
          onProgress={(evt) => {
            const detail: CustomEvent['detail'] = (evt as CustomEvent).detail ?? {};
            const progress: number = typeof detail.progress === "number" ? detail.progress as number : 0;
            const file: File | undefined = detail.file as File ?? selectedFile;
            const id = uploadId || file?.name || "unknown";
            updateUpload(id, { progress });
          }}
          onSuccess={async (evt) => {
            const detail: CustomEvent['detail'] = (evt as CustomEvent).detail ?? {};
            toast("Upload complete; saving metadata");
            const file: File | undefined = detail.file ?? selectedFile;
            const id = uploadId || file?.name || "unknown";
            updateUpload(id, { status: "uploaded" });
            const assetId: string | undefined = detail.assetId as string ?? (detail.asset_id as string | undefined);
            try {
              await api.post("/api/videos/uploads/finalize", {
                title,
                description,
                category,
                visibility,
                type,
                assetId,
              });
              updateUpload(id, { status: "processing" });
            } catch (e: unknown) {
              updateUpload(id, { status: "failed", error: (e as { message?: string })?.message ?? "Finalize failed" });
              toast("Finalize failed");
            }
          }}
          onUploadError={(evt) => {
            const detail: { file?: File; message?: string } = (evt as CustomEvent).detail ?? {};
            const file: File | undefined = detail.file;
            const id = uploadId || file?.name || "unknown";
            const message: string = (detail as { message?: string }).message ?? "Upload failed";
            updateUpload(id, { status: "failed", error: message });
            toast(message);
          }}
        />
      )}
    </div>
  );
}