import express from 'express';
import {
  flagVideo,
  getModerationStats,
  getModerationStatus,
  listModeratedVideos,
  moderateVideo,
} from '../controllers/moderationController';
import { authorise } from '../middleware/authMiddleware';

const moderationRouter = express.Router();

// Public routes (for flagging)
moderationRouter.post('/videos/:videoId/flag', authorise, flagVideo);
moderationRouter.get('/videos/:videoId/status', authorise, getModerationStatus);

// Admin/moderator routes
moderationRouter.post('/videos/:videoId/moderate', authorise, moderateVideo);
moderationRouter.get('/videos', authorise, listModeratedVideos);
moderationRouter.get('/stats', authorise, getModerationStats);

export default moderationRouter;
