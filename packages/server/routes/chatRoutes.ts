import express from 'express';

import { createChat, fetchChats, getChatById } from '../controllers/chatController';
import { authorise } from '../middleware/authMiddleware';

const chatRouter = express.Router();

chatRouter.get('/', authorise, fetchChats);

chatRouter.get('/:id', authorise, getChatById);

chatRouter.post('/', authorise, createChat);

export default chatRouter;
