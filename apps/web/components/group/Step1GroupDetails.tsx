"use client";

import { useCreateGroupStore } from "@/store/useCreateGroupStore";
import { CameraIcon, Edit } from "lucide-react";
import { useMemo, useRef } from "react";
import { TextArea } from "../formComponents/TextArea";
import { TextInput } from "../formComponents/TextInput";

interface Step1GroupDetailsProps {
  onNext?: () => void;
}

const suggestedImages = [
  "https://pub-321aac628169468cb9a4b077e81667e7.r2.dev/default/3d-rendering-cartoon-like-young-couple%20(1).jpg",
  "https://pub-321aac628169468cb9a4b077e81667e7.r2.dev/default/3d-rendering-collective-portrait-men%20(1).jpg",
  "https://pub-321aac628169468cb9a4b077e81667e7.r2.dev/default/boys-friendship-cartoon%20(1)%20(1).jpg",
  "https://pub-321aac628169468cb9a4b077e81667e7.r2.dev/default/boys-friendship-cartoon%20(2)%20(1).jpg",
  "https://pub-321aac628169468cb9a4b077e81667e7.r2.dev/default/boys-friendship-cartoon%20(3).jpg",
  "https://pub-321aac628169468cb9a4b077e81667e7.r2.dev/default/people-connecting-through-hugging%20(1).jpg"
];

const Step1GroupDetails = ({ onNext }: Step1GroupDetailsProps) => {
  const name = useCreateGroupStore((s) => s.name);
  const description = useCreateGroupStore((s) => s.description);
  const image = useCreateGroupStore((s) => s.image);
  const setName = useCreateGroupStore((s) => s.setName);
  const setDescription = useCreateGroupStore((s) => s.setDescription);
  const setImage = useCreateGroupStore((s) => s.setImage);

  const inputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(() => {
    if (!image) return "";
    if (typeof image === "string") return image;
    return URL.createObjectURL(image as File);
  }, [image]);

  const handleInputClick = useMemo(() => () => {
    inputRef.current?.click();
  }, [inputRef.current]);

  const canNext = name.trim().length > 0;

  return (
    <div className="flex-1 p-4 space-y-4">
      <div className="flex flex-col gap-4">
        <div className="w-32 h-32 rounded-full bg-background-accent overflow-hidden flex items-center justify-center border border-border m-auto relative">
          {previewUrl ? (
            <>
              <img src={previewUrl} alt="Group" className="w-full h-full object-cover" />
              <p className="absolute bottom-0 text-center z-30" onClick={handleInputClick}><Edit size={23} color="white" /></p>
            </>
          ) : (
            <div className="absolute inset-0  flex items-center justify-center bg-black/20" onClick={handleInputClick}>
              <p><CameraIcon color="white" size={30} /></p>
            </div>
          )}

        </div>
        <div className="flex-1">
          <TextInput placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} style={{ minHeight: 38 }} />
          <div className="mt-3">
            <TextArea placeholder="Description (optional)" value={description || ""} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
        </div>
      </div>

      <div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setImage(file);
          }}
          ref={inputRef}
          className="text-sm absolute hidden"
        />


        <div className="flex gap-2 mt-2 flex-wrap">
          {suggestedImages.map((url, i) => (
            <button key={i} onClick={() => setImage(url)} className="w-20 h-20 rounded-full overflow-hidden border border-border">
              <img src={url} alt="suggest" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>


    </div>
  );
};

export default Step1GroupDetails;