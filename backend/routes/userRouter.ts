import express from "express";

import { fetchUsers, getUserProfile } from "../controllers/userController";
import { authorise } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authorise, fetchUsers);

router.get("/profile", authorise, getUserProfile);

export default router;
