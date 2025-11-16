import { User } from '@workspace/database';
import { Response } from 'express';
import { AuthRequest } from '../types';

// POST /api/admin/backfill-user-colors
// Iterates over users missing `color` and saves them to trigger schema hook assignment
export const backfillUserColors = async (req: AuthRequest, res: Response) => {
  try {
    const filter = {
      $or: [{ color: { $exists: false } }, { color: '' }, { color: null }],
    } as any;

    const users = await User.find(filter);
    let updatedCount = 0;

    for (const user of users) {
      await user.save();
      updatedCount++;
    }

    res.status(200).json({
      message: 'Backfilled user colors successfully',
      updatedCount,
      totalUsersConsidered: users.length,
    });
  } catch (error: any) {
    console.error('Backfill user colors failed:', error);
    res.status(500).json({ message: 'Failed to backfill user colors', error: error.message });
  }
};