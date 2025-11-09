import { User } from '@workspace/database';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

export const authorise = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    let user = await User.findById((decoded as any).id).select('password');
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    req.userId = user._id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token Expired' });
  }
};
