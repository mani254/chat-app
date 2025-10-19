import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db";
import autoCastQueryParams from "./middleware/autoCastQueryParams";
import { errorHandler } from "./middleware/errorMiddleware";
import authRoutes from "./routes/authRoutes";
import chatRouter from "./routes/chatRouter";
import messageRouter from "./routes/messageRouter";
import otpRoutes from "./routes/otpRoutes";
import userRouter from "./routes/userRouter";

dotenv.config();
connectDB();

const app = express();
const frontendUrl = process.env.FRONTEND_URL || "";

app.use(
  cors({
    origin: [frontendUrl],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);

const queryValuesToCast: Record<string, "number" | "boolean" | "object"> = {
  page: "number",
  limit: "number",
  skip: "number",
  fetchFields: "object",
  isOnline: "boolean",
  isGroupChat: "boolean",
};

app.use("/api/users", autoCastQueryParams(queryValuesToCast), userRouter);
app.use("/api/chats", autoCastQueryParams(queryValuesToCast), chatRouter);
app.use("/api/messages", autoCastQueryParams(queryValuesToCast), messageRouter);

app.use(errorHandler);

export default app;
