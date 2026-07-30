import mongoose, { InferSchemaType, Schema, model } from 'mongoose';
import { DB_COLLECTIONS } from '../connection/database.constants.js';

const otpSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
      trim: true,
    },
    purpose: {
      type: String,
      enum: ['register', 'forgot_password'],
      required: [true, 'Purpose is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Indexes
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB automatic TTL deletion

export type RawOtpDocument = InferSchemaType<typeof otpSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const OtpModel = model<RawOtpDocument>(
  'Otp',
  otpSchema,
  DB_COLLECTIONS.OTPS,
);
