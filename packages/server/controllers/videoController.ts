import Mux from '@mux/mux-node';
import { Video } from '@workspace/database';
import { Request, Response } from 'express';

const muxClient = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export const initDirectUpload = async (req: Request, res: Response) => {
  try {
    // Validate request body for upload initialization
    const { fileSize, fileName, fileType } = req.body;

    // Validate file size (128MB limit)
    const MAX_FILE_SIZE = 128 * 1024 * 1024; // 128MB in bytes
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      console.error(`[Upload Init] File size validation failed: ${fileSize} bytes > ${MAX_FILE_SIZE} bytes`);
      return res.status(400).json({
        message: 'File size exceeds 128MB limit',
        details: {
          maxSize: MAX_FILE_SIZE,
          providedSize: fileSize,
          maxSizeMB: 128,
        },
      });
    }

    // Validate file format
    const ALLOWED_FORMATS = ['.mp4', '.mov', '.avi'];
    const fileExtension = fileName?.toLowerCase().substring(fileName.lastIndexOf('.'));
    if (fileName && !ALLOWED_FORMATS.includes(fileExtension)) {
      console.error(
        `[Upload Init] File format validation failed: ${fileExtension} not in ${ALLOWED_FORMATS.join(', ')}`,
      );
      return res.status(400).json({
        message: 'Invalid file format',
        details: {
          allowedFormats: ALLOWED_FORMATS,
          providedFormat: fileExtension,
        },
      });
    }

    // Log upload initialization attempt
    const userId = (req as { userId?: string }).userId;
    console.log(`[Upload Init] Starting upload initialization for user ${userId}`, {
      fileName,
      fileSize,
      fileType,
      timestamp: new Date().toISOString(),
    });

    const directUpload = await muxClient.video.uploads.create({
      cors_origin: '*',
      new_asset_settings: {
        playback_policy: ['public'],
      },
      // Set timeout to 24 hours for large uploads
      timeout: 86400,
      // Add metadata for tracking
      // metadata: {
      //   userId: userId,
      //   fileName: fileName || 'unknown',
      //   initiatedAt: new Date().toISOString()
      // }
    });

    console.log(`[Upload Init] Successfully created upload URL for user ${userId}`, {
      uploadId: directUpload.id,
      uploadUrl: directUpload.url,
      fileName,
      timestamp: new Date().toISOString(),
    });

    res.json({ url: directUpload.url, id: directUpload.id });
  } catch (err: unknown) {
    const error = err as { message?: string; stack?: string };
    console.error(`[Upload Init] Error creating upload for user:`, {
      error: error.message,
      stack: error.stack,
      body: req.body,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({
      message: 'Failed to initialize upload',
      details: error.message,
    });
  }
};

export const finalizeUpload = async (req: Request, res: Response) => {
  try {
    const { title, description, category, visibility, type, thumbnailKey, assetId, playbackId } = req.body;
    const uploadedBy = (req as { userId?: string }).userId;
    const doc = await Video.create({
      title,
      description,
      category,
      visibility,
      type,
      thumbnailKey,
      assetId,
      playbackId,
      uploadedBy,
      status: playbackId ? 'ready' : 'processing',
    });
    res.json({ video: doc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to finalize upload' });
  }
};

export const listVideos = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', q, category, visibility, type } = req.query as Record<string, string>;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const filter: any = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (visibility) filter.visibility = visibility;
    if (type) filter.type = type;
    const [items, total] = await Promise.all([
      Video.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Video.countDocuments(filter),
    ]);
    res.json({ items, total, page: pageNum, limit: limitNum });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list videos' });
  }
};

export const listShorts = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '12' } = req.query as Record<string, string>;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const filter: any = { type: 'short' };
    const [items, total] = await Promise.all([
      Video.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Video.countDocuments(filter),
    ]);
    res.json({ items, total, page: pageNum, limit: limitNum });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list shorts' });
  }
};

export const getVideo = async (req: Request, res: Response) => {
  try {
    const doc = await Video.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ video: doc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get video' });
  }
};

export const updateVideo = async (req: Request, res: Response) => {
  try {
    const updated = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json({ video: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update video' });
  }
};

export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const doc = await Video.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    // TODO: optionally delete from Mux using assetId
    await doc.deleteOne();
    res.json({ message: 'deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete video' });
  }
};

export const trackVideoView = async (req: Request, res: Response) => {
  try {
    const videoId = req.params.id;
    const userId = (req as { userId?: string }).userId;

    console.log(`[View Tracking] User ${userId} viewed video ${videoId}`);

    // Update view count
    const updated = await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }, { new: true }).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // TODO: Add view tracking for analytics (user, timestamp, etc.)
    // This could be stored in a separate analytics collection

    res.json({ message: 'View tracked', views: updated.views });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error(`[View Tracking] Error tracking view:`, error);
    res.status(500).json({ message: 'Failed to track view', details: error.message });
  }
};

export const toggleVideoLike = async (req: Request, res: Response) => {
  try {
    const videoId = req.params.id;
    const userId = (req as { userId?: string }).userId;
    const { liked } = req.body;

    console.log(`[Like Toggle] User ${userId} ${liked ? 'liked' : 'unliked'} video ${videoId}`);

    // Update like count
    const increment = liked ? 1 : -1;
    const updated = await Video.findByIdAndUpdate(videoId, { $inc: { likes: increment } }, { new: true }).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // TODO: Add user like tracking (store user likes in separate collection)
    // This would allow checking if user has liked a video and persisting likes

    res.json({ message: 'Like updated', likes: updated.likes });
  } catch (err: any) {
    console.error(`[Like Toggle] Error toggling like:`, err);
    res.status(500).json({ message: 'Failed to toggle like', details: err.message });
  }
};
