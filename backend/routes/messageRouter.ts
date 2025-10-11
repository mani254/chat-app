import express from "express";
import multer from "multer";
import {
  fetchMessages,
  getMessageById,
} from "../controllers/messageController";
import { authorise } from "../middleware/authMiddleware";
import { uploadSingleFile } from "../utils/cloudfare";

const router = express.Router();

router.get("/", authorise, fetchMessages);

router.get("/:id", authorise, getMessageById);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      // Images
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".avif",
      ".bmp",
      ".tiff",
      ".svg",
      // Videos
      ".mp4",
      ".webm",
      ".ogg",
      ".avi",
      ".mkv",
      ".flv",
      ".wmv",
      ".mov",
      // Audio
      ".mp3",
      ".wav",
      ".ogg",
      ".m4a",
      ".aac",
      ".flac",
      ".wma",
      // Documents
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
      ".rtf",
      ".odt",
      // Spreadsheets
      ".xls",
      ".xlsx",
      ".ods",
      // Presentations
      ".ppt",
      ".pptx",
      ".odp",
      // Archives
      ".zip",
      ".rar",
      ".7z",
      ".tar",
      ".gz",
      ".bz2",
      // Code files
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".py",
      ".java",
      ".cpp",
      ".c",
      ".cs",
      ".php",
      ".rb",
      ".go",
      ".rs",
      ".swift",
      ".kt",
      ".html",
      ".css",
      ".scss",
      ".sass",
      ".less",
      ".json",
      ".xml",
      ".yaml",
      ".yml",
    ];

    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf("."));

    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${fileExtension} is not allowed`));
    }
  },
});

router.post("/upload", authorise, upload.single("file"), async (req, res) => {
  try {
    const { chatId } = req.body;

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_FILE",
          message: "No file provided",
        },
      });
      return;
    }

    if (!chatId) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_CHAT_ID",
          message: "No chatId provided",
        },
      });
      return;
    }

    // Validate file size
    const fileSizeMB = req.file.size / (1024 * 1024);
    if (fileSizeMB > 25) {
      res.status(400).json({
        success: false,
        error: {
          code: "FILE_TOO_LARGE",
          message: `File size ${fileSizeMB.toFixed(
            1
          )}MB exceeds the 25MB limit`,
        },
      });
      return;
    }

    const { key, url, mimeType, size } = await uploadSingleFile({
      chatId,
      fileBuffer: req.file.buffer,
      originalName: req.file.originalname,
      maxSizeMB: 25,
      makePublic: true,
    });

    res.status(200).json({
      success: true,
      key,
      url,
      mimeType,
      size,
      originalName: req.file.originalname,
    });
  } catch (err: any) {
    console.error("Upload failed", err);

    // Handle specific error types
    if (err.message.includes("File too large")) {
      res.status(400).json({
        success: false,
        error: {
          code: "FILE_TOO_LARGE",
          message: err.message,
        },
      });
    } else if (err.message.includes("Invalid type")) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_FILE_TYPE",
          message: err.message,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: "UPLOAD_FAILED",
          message: err?.message || "Upload failed due to server error",
        },
      });
    }
  }
});

export default router;
