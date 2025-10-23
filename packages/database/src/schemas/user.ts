import bcrypt from 'bcryptjs';
import mongoose, { InferSchemaType, Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name should be less than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'Email already exist'],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: function (this) {
        return this.provider === 'credentials' || !this.provider;
      },
      minlength: [6, 'Password should be at least 6 characters'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    birthday: {
      type: Date,
    },
    avatar: {
      type: String,
      default: 'https://res.cloudinary.com/dd2cl2oly/image/upload/v1744854393/default-image_l4b8k8.svg',
    },
    status: {
      type: String,
      default: 'Hey there! I’m using ChatApp',
      maxlength: [100, 'Status should be less than 100 characters'],
      trim: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    // OAuth fields
    provider: {
      type: String,
      enum: ['credentials', 'google'],
      default: 'credentials',
    },
    providerId: {
      type: String,
      sparse: true,
    },
    phone: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export const User = model('User', userSchema);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};
