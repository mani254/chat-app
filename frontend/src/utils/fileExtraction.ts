import { MediaItem } from "../components/chat/messages/MediaGridPreview";

export function createMediaItemFromUrl(url: string): MediaItem {
  const name = url.split("/").pop() || "unknown";
  const extension = name.split(".").pop()?.toLowerCase();
  let type = "unknown";

  switch (extension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      type = `image/${extension === "jpg" ? "jpeg" : extension}`;
      break;
    case "mp4":
    case "webm":
      type = `video/${extension}`;
      break;
    case "mp3":
    case "wav":
      type = `audio/${extension}`;
      break;
    case "pdf":
      type = "application/pdf";
      break;
    case "doc":
      type = "application/msword";
      break;
    case "docx":
      type =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      break;
    case "txt":
      type = "text/plain";
      break;
  }

  return { url, name, type };
}
