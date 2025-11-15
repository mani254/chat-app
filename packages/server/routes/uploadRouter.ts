import express from 'express';
import { authorise } from '../middleware/authMiddleware';
import { avatarUploadSingle, chatMediaUploadArray } from '../middleware/uploadMiddleware';
import { AuthRequest } from '../types';
import { uploadMultipleFiles, uploadSingleFile } from '../utils/cloudfare';

const uploadRouter = express.Router();

// Route 1: Avatars (users and chats) — single image file up to 2MB
// Use `?target=user` for user avatar, or `?target=chat&chatId=...` for chat avatar
uploadRouter.post('/avatars', authorise, avatarUploadSingle, async (req: AuthRequest, res) => {
  try {
    const target = (req.query.target || req.body?.target) as 'user' | 'chat' | undefined;

    if (!target || !['user', 'chat'].includes(target)) {
      res.status(400).json({ message: "Invalid target. Use 'user' or 'chat'." });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    let folder: string;
    if (target === 'user') {
      folder = `avatars/users`;
    } else {
      folder = `avatars/chats`;
    }

    const result = await uploadSingleFile({
      folder,
      fileBuffer: req.file.buffer,
      originalName: req.file.originalname,
      contentType: req.file.mimetype,
      makePublic: true,
    });

    res.status(201).json({ url: result.url, key: result.key });
  } catch (err: any) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// Route 2: Chat media — single or multiple files up to 15MB each
// Field name: 'files' (supports multiple); stored under '<chatId>/'
uploadRouter.post('/media/:chatId', authorise, chatMediaUploadArray, async (req, res) => {
  try {
    const { chatId } = req.params as { chatId: string };
    if (!chatId) {
      res.status(400).json({ message: 'chatId is required' });
      return;
    }

    const files = (req.files || []) as Express.Multer.File[];
    if (!files.length) {
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }

    const results = await uploadMultipleFiles({
      folder: chatId,
      files: files.map((f) => ({ buffer: f.buffer, originalName: f.originalname, contentType: f.mimetype })),
      makePublic: true,
    });

    res.status(201).json({ files: results });
  } catch (err: any) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

export default uploadRouter;
