import mongoose, { Document, Schema } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  type: "email_verification" | "password_reset";
  expiresAt: Date;
  isUsed: boolean;
  attempts: number;
  maxAttempts: number;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: [true, "OTP is required"],
      length: [6, "OTP must be 6 digits"],
    },
    type: {
      type: String,
      enum: ["email_verification", "password_reset"],
      required: [true, "OTP type is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index
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
  { timestamps: true }
);

// Index for efficient queries
OtpSchema.index({ email: 1, type: 1, isUsed: 1 });
OtpSchema.index({ otp: 1, email: 1 });

export default mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
