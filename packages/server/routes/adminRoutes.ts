import express from 'express';
import { authorise } from '../middleware/authMiddleware';
import { backfillUserColors } from '../controllers/adminController';

const adminRouter = express.Router();

// One-time route: backfill color for existing users
adminRouter.post('/backfill-user-colors', authorise, backfillUserColors);

export default adminRouter;