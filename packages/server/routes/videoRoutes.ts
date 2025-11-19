import express from 'express';
import { handleMuxWebhook } from '../controllers/muxWebhookController';
import {
  deleteVideo,
  finalizeUpload,
  getVideo,
  initDirectUpload,
  listShorts,
  listVideos,
  updateVideo,
  trackVideoView,
  toggleVideoLike,
} from '../controllers/videoController';
import { authorise } from '../middleware/authMiddleware';

const videoRouter = express.Router();

videoRouter.post('/uploads', authorise, initDirectUpload);
videoRouter.post('/uploads/finalize', authorise, finalizeUpload);

videoRouter.get('/', authorise, listVideos);
videoRouter.get('/shorts', authorise, listShorts);
videoRouter.get('/:id', authorise, getVideo);
videoRouter.patch('/:id', authorise, updateVideo);
videoRouter.delete('/:id', authorise, deleteVideo);

// Analytics endpoints
videoRouter.post('/:id/view', authorise, trackVideoView);
videoRouter.post('/:id/like', authorise, toggleVideoLike);

// Mux webhooks — do NOT require auth; validated via signing secret
videoRouter.post('/webhook', handleMuxWebhook);

export default videoRouter;
