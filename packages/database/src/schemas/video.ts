import mongoose, { Schema, Document, Model } from 'mongoose';

export type VideoVisibility = 'public' | 'unlisted' | 'private';
export type VideoType = 'long' | 'short';
export type VideoStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export interface IVideo extends Document {
  assetId?: string;
  playbackId?: string;
  title: string;
  description?: string;
  thumbnailKey?: string;
  category?: string;
  visibility: VideoVisibility;
  type: VideoType;
  duration?: number;
  status: VideoStatus;
  uploadedBy: mongoose.Types.ObjectId;
  likes?: number;
  views?: number;
  comments?: number;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    assetId: { type: String, index: true },
    playbackId: { type: String, index: true },
    title: { type: String, required: true },
    description: { type: String },
    thumbnailKey: { type: String },
    category: { type: String, index: true },
    visibility: { type: String, enum: ['public', 'unlisted', 'private'], default: 'private', index: true },
    type: { type: String, enum: ['long', 'short'], required: true, index: true },
    duration: { type: Number },
    status: { type: String, enum: ['uploading', 'processing', 'ready', 'failed'], default: 'uploading', index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
  },
  { timestamps: true },
);

VideoSchema.index({ title: 'text', description: 'text' });
VideoSchema.index({ createdAt: -1 });

export const Video: Model<IVideo> = mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);