import mongoose, { InferSchemaType, model, Schema } from 'mongoose';

const OtpSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
      length: [6, 'OTP must be 6 digits'],
    },
    type: {
      type: String,
      enum: ['email_verification', 'password_reset'],
      required: [true, 'OTP type is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
  },
  { timestamps: true },
);

// Index for efficient queries
OtpSchema.index({ email: 1, type: 1, isUsed: 1 });
OtpSchema.index({ otp: 1, email: 1 });

export const Otp = model('Otp', OtpSchema);

export type OtpDocument = InferSchemaType<typeof OtpSchema> & {
  _id: mongoose.Types.ObjectId;
};
