import { useUserStore } from "@/store/useUserStore";
import { formatTime } from "@/utils/formaters";
import { MessageWithSender } from "@workspace/database";
import { cn } from "@workspace/ui/lib/utils";
import MediaGridView from "./MediaGridView";
import MessageBubbleShape from "./MessageBubbleShape";

const testingData = [
  // { url: "https://pub-321aac628169468cb9a4b077e81667e7.r2.dev/6890ebb58210e375aa0dcf0d/ed5aaa33-e7a8-47c7-9884-568f892aebce.png" },
  { url: "https://pub-321aac628169468cb9a4b077e81667e7.r2.dev/6890ebb58210e375aa0dcf0d/6a1ad632-26b5-4d0d-b863-b0b1753a492b.webp" },
  { url: "https://file-examples.com/wp-content/storage/2017/08/file_example_PPT_250kB.ppt" },
  { url: "https://file-examples.com/wp-content/storage/2017/02/file-sample_100kB.doc" },
  { url: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3" },
  // { url: "https://pub-321aac628169468cb9a4b077e81667e7.r2.dev/68e80565ca041b64c850c6d5/dcbce872-ced2-4fda-8f1d-00846b73ca98.mp4" }
  { url: "https://pdfobject.com/pdf/sample.pdf" }
]


const MessageBubble = ({ message }: { message: MessageWithSender }) => {
  const currentUser = useUserStore((s) => s.currentUser);
  const isOwnMessage = message.sender._id === currentUser?._id;
  const isNote = message.messageType == "note"
  const isText = message.messageType == "text"
  const isMedia = message.messageType == "media"

  const mediaData = message.mediaLinks.map((link) => ({ url: link })) || testingData

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

      {isMedia && <div>
        <MessageBubbleShape type={isOwnMessage ? "right" : "left"} media={true}>
          <div className="relative z-[20]">
            <MediaGridView items={mediaData} />
          </div>
        </MessageBubbleShape>
      </div>}


    </li>
  );
};






export default MessageBubble;
