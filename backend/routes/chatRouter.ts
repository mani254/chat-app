import express from "express";

import { fetchChats, getChatById,createChat } from "../controllers/chatController";
import { authorise } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authorise, fetchChats);

router.get("/:id", authorise, getChatById);

router.post("/",authorise,createChat)

export default router;
