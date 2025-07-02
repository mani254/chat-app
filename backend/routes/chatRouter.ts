import express from "express";

import { fetchChats } from "../controllers/chatController";
import { authorise } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authorise, fetchChats);

// router.get("/:id", authorise, getChatById);

export default router;
