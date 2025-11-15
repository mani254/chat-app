"use client";

import api from "@/lib/api";
import { useChatStore } from "@/store/useChatStore";
import { useCreateGroupStore } from "@/store/useCreateGroupStore";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "@workspace/ui/components/sonner";
import { Check, CheckCircle, FileText, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ResponsiveModal } from "../common/ResponsiveModal";
import Step1GroupDetails from "../group/Step1GroupDetails";
import Step2GroupMembers from "../group/Step2GroupMembers";
import Step3Review from "../group/Step3Review";

interface NewGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("avatar", file);
  try {
    const res = await api.post(`/api/uploads/avatars?target=chat`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const url: string | undefined = res?.data?.url;
    if (!url) throw new Error("Upload did not return a URL");
    return url;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || "Failed to upload image";
    toast.error("Failed to upload image", { description: msg });
    throw err;
  }
};

const StepHeader = ({ step, allowStep2, allowStep3, onSetStep }: { step: 1 | 2 | 3; allowStep2: boolean; allowStep3: boolean; onSetStep: (s: 1 | 2 | 3) => void }) => {
  const items = [
    { id: 1 as const, label: "Details", icon: FileText, enabled: true },
    { id: 2 as const, label: "Members", icon: Users, enabled: allowStep2 },
    { id: 3 as const, label: "Review", icon: CheckCircle, enabled: allowStep3 },
  ];
  return (
    <div className="sticky top-0 z-10 bg-background px-4 py-3 border-b border-border flex items-center gap-3">
      {items.map((s, idx) => {
        const isActive = step === s.id;
        const isCompleted = step > s.id || (s.id === 2 && allowStep2 && step > 2) || (s.id === 3 && allowStep3 && step > 3);
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            onClick={() => s.enabled && onSetStep(s.id)}
            disabled={!s.enabled}
            className="flex items-center gap-2 disabled:opacity-50"
            aria-current={isActive ? "step" : undefined}
          >
            <span className={(isActive ? "bg-primary text-white" : "bg-background-accent text-foreground") + " inline-flex items-center justify-center w-7 h-7 rounded-full"}>
              {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
            </span>
            <span className={isActive ? "text-sm font-semibold" : "text-sm text-foreground-accent"}>{s.label}</span>
            {idx !== items.length - 1 && <span className="w-8 h-px bg-border mx-1" />}
          </button>
        );
      })}
    </div>
  );
};

const NewGroupModal = ({ open, onOpenChange }: NewGroupModalProps) => {
  const router = useRouter();

  const currentUser = useUserStore((s) => s.currentUser);
  const createChat = useChatStore((s) => s.createChat);

  const name = useCreateGroupStore((s) => s.name);
  const description = useCreateGroupStore((s) => s.description);
  const image = useCreateGroupStore((s) => s.image);
  const users = useCreateGroupStore((s) => s.users);
  const setName = useCreateGroupStore((s) => s.setName);
  const setDescription = useCreateGroupStore((s) => s.setDescription);
  const setImage = useCreateGroupStore((s) => s.setImage);
  const addUser = useCreateGroupStore((s) => s.addUser);
  const setUsers = useCreateGroupStore((s) => s.setUsers);
  const resetUsers = useCreateGroupStore((s) => s.resetUsers);



  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  const canCreate = useMemo(() => users.length > 0 && name.trim().length > 0 && !!currentUser, [users.length, name, currentUser]);

  const toggleMember = (user: any) => {
    const id = user._id.toString();
    const exists = users.includes(id);
    if (exists) {
      setUsers(users.filter((u) => u !== id));
      setSelectedMembers((prev) => prev.filter((u) => u._id.toString() !== id));
    } else {
      addUser(id);
      setSelectedMembers((prev) => (prev.some((u) => u._id.toString() === id) ? prev : [user, ...prev]));
    }
  };

  const removeSelectedMember = (id: string) => {
    setUsers(users.filter((u) => u !== id));
    setSelectedMembers((prev) => prev.filter((u) => u._id.toString() !== id));
  };

  const resetAll = () => {
    setName("");
    setDescription("");
    setImage("");
    resetUsers();
    setSearch("");
    setSelectedMembers([]);
    setStep(1);
  };

  const handleCreateGroup = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to create a group");
      return;
    }
    if (!canCreate) return;
    setCreating(true);
    try {
      const adminId = currentUser._id.toString();
      const uniqueUsers = Array.from(new Set([...users, adminId]));
      let finalImageUrl: string | undefined;
      if (image instanceof File) {
        try {
          finalImageUrl = await uploadImage(image);
          setImage(finalImageUrl);
        } catch (_) {
          // If upload fails, proceed without avatar; toast already shown in uploadImage
          finalImageUrl = undefined;
        }
      } else if (typeof image === "string" && image.trim().length > 0) {
        finalImageUrl = image.trim();
      }
      const chat = await createChat({
        users: uniqueUsers,
        isGroupChat: true,
        name: name.trim(),
        groupAdmin: adminId,
        description: (description || '').trim() || undefined,
        avatar: finalImageUrl,
      });
      if (chat && chat._id) {
        onOpenChange(false);
        resetAll();
        router.push(`/?chatId=${chat._id}`);
      } else {
        toast.error("Failed to create group");
      }
    } catch (err: any) {
      toast.error("Error creating group", { description: err?.message });
    } finally {
      setCreating(false);
    }
  };

  const isStep1Complete = name.trim().length > 0;
  const isStep2Complete = users.length > 0;

  return (
    <ResponsiveModal open={open} onOpenChange={(o) => {
      onOpenChange(o);
      if (!o) resetAll();
    }} title="New Group">
      <div className="relative h-full flex flex-col overflow-hidden">
        <StepHeader step={step} allowStep2={isStep1Complete} allowStep3={isStep2Complete} onSetStep={(s) => {
          if (s === 1) setStep(1);
          if (s === 2 && isStep1Complete) setStep(2);
          if (s === 3 && isStep2Complete) setStep(3);
        }} />

        <div className="flex-1 overflow-y-auto pb-20">
          {step === 1 && (
            <Step1GroupDetails />
          )}

          {step === 2 && (
            <Step2GroupMembers
              search={search}
              setSearch={setSearch}
              selectedMembers={selectedMembers}
              onToggleMember={toggleMember}
              onRemoveSelectedMember={removeSelectedMember}
              selectedIds={users}
            />
          )}

          {step === 3 && (
            <Step3Review
              name={name}
              description={description}
              image={image}
              currentUser={currentUser}
              selectedMembers={selectedMembers}
              canCreate={canCreate}
              creating={creating}
            />
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-background border-t border-border p-3 flex justify-between">
          <button
            onClick={() => setStep(step === 1 ? 1 : (step - 1) as 1 | 2 | 3)}
            className="px-3 py-2 rounded-2xl border border-border"
            disabled={step === 1}
          >
            Back
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step === 1 ? (isStep1Complete ? 2 : 1) : (isStep2Complete ? 3 : 2))}
              className="px-3 py-2 rounded-2xl bg-primary text-white disabled:opacity-50"
              disabled={step === 1 ? !isStep1Complete : !isStep2Complete}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleCreateGroup}
              className="px-3 py-2 rounded-2xl bg-primary text-white disabled:opacity-50"
              disabled={!canCreate || creating}
            >
              {creating ? "Creating..." : "Create Group"}
            </button>
          )}
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default NewGroupModal;