import { cn } from "@workspace/ui/lib/utils";

export default function MessageBubbleShape({
  children,
  type,
}: {
  children: React.ReactNode;
  type: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "relative px-3 py-[6px] rounded-xl border shadow-sm max-w-xs",
        type === "left" && "bg-white border-border text-foreground",
        type === "right" && "bg-primary border-primary/40 text-primary-accent ml-auto"
      )}
    >
      {children}

      {type === "left" && (
        <>
          <div className="absolute -left-[10px] top-0 text-border">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="9"
              viewBox="0 0 22 9"
              className="fill-white stroke-current"
            >
              <path d="M0 0.5L22 0C13 1 13 5.5 12 8.5L0 0.5Z" />
            </svg>
          </div>
          <div className="absolute w-[8px] h-[8px] top-[1px] left-[0.8px] bg-white"></div>
        </>
      )}

      {type === "right" && (
        <>
          <div className="absolute -right-[10px] top-0 text-primary/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="8"
              viewBox="0 0 22 8"
              className="fill-primary stroke-current"
            >
              <path d="M24 0.470588L0 0C9.81818 0.941176 9.81818 5.17647 10.9091 8L24 0.470588Z" />
            </svg>
          </div>
          <div className="absolute w-[8px] h-[8px] top-[1px] right-[0.8px] bg-primary"></div>
        </>
      )}
    </div>
  );
}