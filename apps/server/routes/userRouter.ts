import express from 'express';

import { fetchUsers, getUserProfile } from '../controllers/userController';
import { authorise } from '../middleware/authMiddleware';

const userRouter = express.Router();

userRouter.get('/', authorise, fetchUsers);

userRouter.get('/profile', authorise, getUserProfile);

export default userRouter;
