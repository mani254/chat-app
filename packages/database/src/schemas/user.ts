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
      default: '',
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
    // OAuth fieldsf
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
    color: {
      type: String,
    },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ provider: 1, providerId: 1 }, { unique: true, sparse: true });
userSchema.index({ isOnline: 1 });
userSchema.index({ name: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ emailVerified: 1 });
userSchema.index({ gender: 1 });

// Generate a random accessible color with good contrast on white
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function relativeLuminance(r: number, g: number, b: number): number {
  const srgb = [r, g, b].map((v) => v / 255);
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const [R, G, B] = srgb.map(toLinear);
  if (R && G && B) {
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  } else {
    return 0;
  }
}

function contrastRatioWithWhite(r: number, g: number, b: number): number {
  const L1 = 1.0; // white luminance
  const L2 = relativeLuminance(r, g, b);
  return (L1 + 0.05) / (L2 + 0.05);
}

function generateAccessibleColor(): string {
  // Try up to N attempts to find a color with WCAG contrast >= 4.5 against white
  const MIN_CONTRAST = 4.5;
  for (let i = 0; i < 10; i++) {
    const h = Math.floor(Math.random() * 360);
    const s = 60 + Math.floor(Math.random() * 25); // 60–85%
    const l = 20 + Math.floor(Math.random() * 18); // 20–38% (darker for contrast)
    const [r, g, b] = hslToRgb(h, s, l);
    const ratio = contrastRatioWithWhite(r, g, b);
    if (ratio >= MIN_CONTRAST) {
      return rgbToHex(r, g, b);
    }
  }
  // Fallback dark gray with good contrast
  return '#333333';
}

// Ensure password hashing and color assignment on save
userSchema.pre('save', async function (next) {
  // Assign color if missing
  if (!this.color || typeof this.color !== 'string' || this.color.trim() === '') {
    this.color = generateAccessibleColor();
  }

  // Hash password when present and modified
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const User = model('User', userSchema);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};
