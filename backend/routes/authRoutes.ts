import express from "express";
import {
  createRefreshToken,
  handleLogout,
  loginUser,
  registerUser,
} from "../controllers/authController";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/refresh", createRefreshToken);

router.post("/logout", handleLogout);

export default router;
