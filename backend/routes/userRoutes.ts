import express, { Response } from "express";
import { authorise, AuthRequest } from "../middleware/authMiddleware";
import User from "../models/User";
const router = express.Router();

router.get("/profile", authorise, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    res.status(200).json({ message: "user fetched succesfully", data: user });
  } catch (err: any) {
    console.error(err.message);
  }
});

export default router