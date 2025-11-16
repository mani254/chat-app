import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/authRoutes';
import chatRouter from './routes/chatRoutes';
import messageRouter from './routes/messageRoutes';
import otpRouter from './routes/otpRouter';
import userRouter from './routes/userRouter';
import uploadRouter from './routes/uploadRouter';
import adminRouter from './routes/adminRoutes';

dotenv.config();
connectDB();

const app = express();
const frontendUrl = process.env.FRONTEND_URL || '';

app.use(
  cors({
    origin: [frontendUrl, 'http://localhost:3000'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/otp', otpRouter);
app.use('/api/users', userRouter);
app.use('/api/chats', chatRouter);
app.use('/api/messages', messageRouter);
app.use('/api/uploads', uploadRouter);
app.use('/api/admin', adminRouter);

app.use(errorHandler);

export default app;
