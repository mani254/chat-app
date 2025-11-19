import { Request, Response } from 'express';
import { Moderation, Video } from '@workspace/database';

export const flagVideo = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { reason, description } = req.body;
    const userId = (req as any).userId;
    
    if (!reason || !['spam', 'inappropriate', 'copyright', 'other'].includes(reason)) {
      return res.status(400).json({ 
        message: 'Invalid flag reason. Must be: spam, inappropriate, copyright, or other' 
      });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Find or create moderation record
    let moderation = await Moderation.findOne({ videoId });
    
    if (!moderation) {
      moderation = new Moderation({
        videoId,
        status: 'pending',
        flags: { spam: 0, inappropriate: 0, copyright: 0, other: 0 },
        flagDetails: []
      });
    }

    // Check if user already flagged this video
    const existingFlag = moderation.flagDetails.find(
      flag => flag.flaggedBy.toString() === userId.toString()
    );

    if (existingFlag) {
      return res.status(400).json({ 
        message: 'You have already flagged this video' 
      });
    }

    // Add flag details
    moderation.flagDetails.push({
      reason,
      flaggedBy: userId,
      description: description || '',
      flaggedAt: new Date()
    });

    // Increment flag counter
    moderation.flags[reason as keyof typeof moderation.flags] += 1;

    // Auto-flag if certain thresholds are met
    const totalFlags = Object.values(moderation.flags).reduce((a, b) => a + b, 0);
    if (totalFlags >= 3 || moderation.flags.inappropriate >= 2) {
      moderation.status = 'flagged';
      
      // Optionally hide video from public feeds
      if (video.visibility === 'public') {
        video.visibility = 'unlisted';
        await video.save();
      }
    }

    await moderation.save();

    console.log(`[Moderation] Video ${videoId} flagged by user ${userId} for: ${reason}`);

    res.json({ 
      message: 'Video flagged successfully',
      moderation: {
        status: moderation.status,
        flags: moderation.flags,
        totalFlags
      }
    });
  } catch (err: any) {
    console.error(`[Moderation] Error flagging video:`, err);
    res.status(500).json({ 
      message: 'Failed to flag video',
      details: err.message 
    });
  }
};

export const moderateVideo = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { action, reason } = req.body;
    const moderatorId = (req as any).userId;
    
    if (!action || !['approve', 'reject', 'flag', 'unflag'].includes(action)) {
      return res.status(400).json({ 
        message: 'Invalid action. Must be: approve, reject, flag, or unflag' 
      });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Find or create moderation record
    let moderation = await Moderation.findOne({ videoId });
    
    if (!moderation) {
      moderation = new Moderation({
        videoId,
        status: 'pending',
        flags: { spam: 0, inappropriate: 0, copyright: 0, other: 0 },
        flagDetails: []
      });
    }

    // Update moderation status based on action
    switch (action) {
      case 'approve':
        moderation.status = 'approved';
        moderation.reason = reason || 'Approved by moderator';
        // Restore visibility if it was hidden
        if (video.visibility === 'unlisted' && moderation.flags.inappropriate < 2) {
          video.visibility = 'public';
          await video.save();
        }
        break;
        
      case 'reject':
        moderation.status = 'rejected';
        moderation.reason = reason || 'Rejected by moderator';
        // Hide video from public
        if (video.visibility === 'public') {
          video.visibility = 'private';
          await video.save();
        }
        break;
        
      case 'flag':
        moderation.status = 'flagged';
        moderation.reason = reason || 'Flagged by moderator';
        // Hide video from public feeds
        if (video.visibility === 'public') {
          video.visibility = 'unlisted';
          await video.save();
        }
        break;
        
      case 'unflag':
        moderation.status = 'approved';
        moderation.reason = reason || 'Unflagged by moderator';
        // Restore visibility if appropriate
        if (video.visibility === 'unlisted') {
          video.visibility = 'public';
          await video.save();
        }
        break;
    }

    moderation.moderatedBy = moderatorId;
    moderation.moderatedAt = new Date();

    await moderation.save();

    console.log(`[Moderation] Video ${videoId} ${action}ed by moderator ${moderatorId}`);

    res.json({ 
      message: `Video ${action}ed successfully`,
      moderation: {
        status: moderation.status,
        reason: moderation.reason,
        moderatedBy: moderation.moderatedBy,
        moderatedAt: moderation.moderatedAt
      }
    });
  } catch (err: any) {
    console.error(`[Moderation] Error moderating video:`, err);
    res.status(500).json({ 
      message: 'Failed to moderate video',
      details: err.message 
    });
  }
};

export const getModerationStatus = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    
    const moderation = await Moderation.findOne({ videoId })
      .populate('moderatedBy', 'username')
      .populate('flagDetails.flaggedBy', 'username')
      .lean();
    
    if (!moderation) {
      return res.json({ 
        status: 'pending',
        flags: { spam: 0, inappropriate: 0, copyright: 0, other: 0 },
        flagDetails: []
      });
    }

    res.json(moderation);
  } catch (err: any) {
    console.error(`[Moderation] Error getting moderation status:`, err);
    res.status(500).json({ 
      message: 'Failed to get moderation status',
      details: err.message 
    });
  }
};

export const listModeratedVideos = async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    const filter: any = {};
    if (status && ['pending', 'approved', 'rejected', 'flagged'].includes(status as string)) {
      filter.status = status;
    }

    const [items, total] = await Promise.all([
      Moderation.find(filter)
        .populate('videoId', 'title description playbackId uploadedBy createdAt')
        .populate('moderatedBy', 'username')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Moderation.countDocuments(filter)
    ]);

    res.json({ items, total, page: pageNum, limit: limitNum });
  } catch (err: any) {
    console.error(`[Moderation] Error listing moderated videos:`, err);
    res.status(500).json({ 
      message: 'Failed to list moderated videos',
      details: err.message 
    });
  }
};

export const getModerationStats = async (req: Request, res: Response) => {
  try {
    const stats = await Moderation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const flagStats = await Moderation.aggregate([
      {
        $group: {
          _id: null,
          totalSpam: { $sum: '$flags.spam' },
          totalInappropriate: { $sum: '$flags.inappropriate' },
          totalCopyright: { $sum: '$flags.copyright' },
          totalOther: { $sum: '$flags.other' }
        }
      }
    ]);

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      statusCounts,
      flagCounts: flagStats[0] || {
        totalSpam: 0,
        totalInappropriate: 0,
        totalCopyright: 0,
        totalOther: 0
      }
    });
  } catch (err: any) {
    console.error(`[Moderation] Error getting moderation stats:`, err);
    res.status(500).json({ 
      message: 'Failed to get moderation stats',
      details: err.message 
    });
  }
};