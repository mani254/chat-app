import express from "express";
import multer from "multer";
import {
  fetchMessages,
  getMessageById,
} from "../controllers/messageController";
import { authorise } from "../middleware/authMiddleware";
import { uploadSingleFile } from "../utils/cloudfare";

const router = express.Router();

// GET /api/messages?chatId=...&page=... => fetch paginated list
router.get("/", authorise, fetchMessages);

// GET /api/messages/:id => fetch single message by ID
router.get("/:id", authorise, getMessageById);

// POST /api/messages/upload - upload a single file to R2 and return URL
const upload = multer({ storage: multer.memoryStorage() });
router.post("/upload", authorise, upload.single("file"), async (req, res) => {
  try {
    const { chatId } = req.body;
    if (!req.file) {
      res.status(400).json({ message: "No file provided" });
      return;
    }
    if (!chatId) {
      res.status(400).json({ message: "No chatId provided" });
      return;
    }

    const { key, url, mimeType, size } = await uploadSingleFile({
      chatId,
      fileBuffer: req.file.buffer,
      originalName: req.file.originalname,
      maxSizeMB: 25,
      makePublic: true,
    });

    res.status(200).json({ key, url, mimeType, size });
  } catch (err: any) {
    console.error("Upload failed", err);
    res.status(500).json({ message: "Upload failed", error: err?.message });
  }
});

export default router;
