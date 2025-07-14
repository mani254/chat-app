import express from "express";

import {
  fetchMessages,
  getMessageById,
} from "../controllers/messageController";
import { authorise } from "../middleware/authMiddleware";

const router = express.Router();

// GET /api/messages?chatId=...&page=... => fetch paginated list
router.get("/", authorise, fetchMessages);

// GET /api/messages/:id => fetch single message by ID
router.get("/:id", authorise, getMessageById);

export default router;
