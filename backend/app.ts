import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db";
import autoCastQueryParams from "./middleware/autoCastQueryParams";
import { errorHandler } from "./middleware/errorMiddleware";
import authRoutes from "./routes/authRoutes";
import chatRouter from "./routes/chatRouter";
import userRouter from "./routes/userRouter";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3002", "*"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

const queryValuesToCast: Record<string, "number" | "boolean" | "object"> = {
  page: "number",
  limit: "number",
  fetchFields: "object",
  isOnline: "boolean",
};

app.use("/api/users", autoCastQueryParams(queryValuesToCast), userRouter);
app.use("/api/chats", autoCastQueryParams(queryValuesToCast), chatRouter);

// app.use("/api/chats", chatRoutes);
// app.use("/api/messages", messageRoutes);

app.use(errorHandler);

export default app;
