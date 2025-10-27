import { Request } from 'express';
import { Types } from 'mongoose';

export type AuthRequest = Request & { userId?: Types.ObjectId };
