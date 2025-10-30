import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/authRoutes';
import chatRouter from './routes/chatRoutes';
import otpRouter from './routes/otpRouter';
import userRouter from './routes/userRouter';

dotenv.config();
connectDB();

const app = express();
const frontendUrl = process.env.FRONTEND_URL || '';

app.use(
  cors({
    origin: [frontendUrl],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/otp', otpRouter);
app.use('/api/users', userRouter);
app.use('/api/chats', chatRouter);

app.use(errorHandler);

export default app;
