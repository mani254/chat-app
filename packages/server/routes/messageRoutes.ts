import express from 'express';
import { fetchMessages } from '../controllers/messageController';
import { authorise } from '../middleware/authMiddleware';

const messageRouter = express.Router();

messageRouter.get('/', authorise, fetchMessages);

export default messageRouter;
