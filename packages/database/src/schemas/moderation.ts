import mongoose, { Schema, Document, Model } from 'mongoose';

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type ModerationAction = 'approve' | 'reject' | 'flag' | 'unflag';

export interface IModeration extends Document {
  videoId: mongoose.Types.ObjectId;
  status: ModerationStatus;
  reason?: string;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  flags: {
    spam: number;
    inappropriate: number;
    copyright: number;
    other: number;
  };
  flagDetails: Array<{
    reason: string;
    flaggedBy: mongoose.Types.ObjectId;
    flaggedAt: Date;
    description?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ModerationSchema = new Schema<IModeration>(
  {
    videoId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Video', 
      required: true, 
      unique: true,
      index: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'flagged'], 
      default: 'pending',
      index: true 
    },
    reason: { type: String },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: { type: Date },
    flags: {
      spam: { type: Number, default: 0 },
      inappropriate: { type: Number, default: 0 },
      copyright: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    flagDetails: [{
      reason: { type: String, required: true },
      flaggedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      flaggedAt: { type: Date, default: Date.now },
      description: { type: String }
    }]
  },
  { timestamps: true }
);

// Indexes for moderation queries
ModerationSchema.index({ status: 1, createdAt: -1 });
ModerationSchema.index({ 'flags.spam': -1 });
ModerationSchema.index({ 'flags.inappropriate': -1 });
ModerationSchema.index({ 'flags.copyright': -1 });
ModerationSchema.index({ 'flags.other': -1 });

export const Moderation: Model<IModeration> = mongoose.models.Moderation || mongoose.model<IModeration>('Moderation', ModerationSchema);