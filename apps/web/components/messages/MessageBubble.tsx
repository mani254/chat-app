import { useUserStore } from "@/store/useUserStore";
import { formatTime } from "@/utils/formaters";
import { MessageWithSender } from "@workspace/database";
import { cn } from "@workspace/ui/lib/utils";
import MessageBubbleShape from "./MessageBubbleShape";


const MessageBubble = ({ message }: { message: MessageWithSender }) => {
  const currentUser = useUserStore((s) => s.currentUser);
  const isOwnMessage = message.sender._id === currentUser?._id;
  const isNote = message.messageType == "note"
  const isText = message.messageType == "text"
  const isMedia = message.messageType == "media"

  return (
    <li
      className={cn(
        "flex w-full",
        isOwnMessage ? "justify-end" : "justify-start",
        isNote && "justify-center"
      )}
    >
      {/* when the message type is not show it in the center  */}
      {isNote && <div
        className={cn(
          "max-w-[75%] px-3 py-1 rounded-2xl border border-border text-[11px] bg-background",
        )}
      >
        {message.content}
      </div>}

      {/* {isText && <div className="flex items-start relative">
        <div className=" max-w-xs bg-white border border-gray-300 rounded-xl px-3 py-2 shadow-sm ">
          <p className="text-sm text-gray-900">0 availability?</p>
          <span className="text-[10px] text-gray-500 block text-right mt-1">12:00 PM</span>
        </div>
        <div className="top-0 absolute -left-[10px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="9" viewBox="0 0 22 9" fill="none" stroke="#D1D5DB">
            <path d="M0 0.5L22 0C13 1 13 5.5 12 8.5L0 0.5Z" fill="white" />
          </svg>
        </div>
        <div className="absolute w-[8px] h-[8px]  top-[1px] left-[0.8px] bg-white">
        </div>
      </div>
      } */}
      {isText && (
        <MessageBubbleShape type={isOwnMessage ? "right" : "left"}>
          <div className="pb-1 pr-[50px]">
            <p className="text-[15px]">
              {message.content}
            </p>
            <span className={cn("absolute bottom-[2px] right-2 text-[10px]", isOwnMessage ? "text-primary-accent/85" : "text-foreground-accent/85")}>
              {formatTime(message.createdAt)}
            </span>
          </div>
        </MessageBubbleShape>
      )}

      {isMedia && <div>media here</div>}


    </li>
  );
};






export default MessageBubble;
