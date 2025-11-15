"use client";

interface Step3ReviewProps {
  name: string;
  description?: string | null;
  image?: File | string | null | undefined;
  currentUser: any | null;
  selectedMembers: any[];
  canCreate: boolean;
  creating: boolean;
  onBack?: () => void;
  onCreate?: () => void;
}

const Step3Review = ({ name, description, image, currentUser, selectedMembers, canCreate, creating, onBack, onCreate }: Step3ReviewProps) => {
  const previewUrl = image ? (typeof image === "string" ? image : URL.createObjectURL(image as File)) : "";

  return (
    <div className="flex-1 p-4 pb-20 flex flex-col">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-background-accent overflow-hidden flex items-center justify-center border border-border">
          {previewUrl ? (
            <img src={previewUrl} alt="Group" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm text-foreground-accent">IMG</span>
          )}
        </div>
        <div>
          <div className="text-base font-semibold">{name}</div>
          {description && <div className="text-sm text-foreground-accent mt-1">{description}</div>}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm font-medium mb-2">Members ({selectedMembers.length + (currentUser ? 1 : 0)})</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {currentUser && (
            <div className="p-2 rounded-2xl border border-border">
              <div className="text-sm font-medium">{currentUser.name}</div>
              <div className="text-xs text-foreground-accent">Admin</div>
            </div>
          )}
          {selectedMembers.map((u) => (
            <div key={u._id.toString()} className="p-2 rounded-2xl border border-border">
              <div className="text-sm font-medium">{u.name}</div>
              <div className="text-xs text-foreground-accent">Member</div>
            </div>
          ))}
        </div>
      </div>

      
    </div>
  );
};

export default Step3Review;