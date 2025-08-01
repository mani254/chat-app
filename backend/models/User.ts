// models/User.ts
import bcrypt from "bcryptjs";
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  gender: "male" | "female" | "other";
  status?: string;
  isOnline?: boolean;
  birthday?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name should be less than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exist"],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password should be at least 6 characters"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    birthday: {
      type: Date,
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dd2cl2oly/image/upload/v1744854393/default-image_l4b8k8.svg",
    },
    status: {
      type: String,
      default: "Hey there! I’m using ChatApp",
      maxlength: [100, "Status should be less than 100 characters"],
      trim: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// UserSchema.methods.matchPassword = async function (enteredPassword: string) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
