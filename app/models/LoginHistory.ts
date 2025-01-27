import mongoose from "mongoose";

export interface ILoginHistory {
  _id: string;
  userId: string;
  email: string;
  ip: string;
  userAgent: string;
  country: string;
  city: string;
  browser: string;
  os: string;
  device: string;
  success: boolean;
  failureReason?: string;
  createdAt: Date;
}

const loginHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: true },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    country: String,
    city: String,
    browser: String,
    os: String,
    device: String,
    success: { type: Boolean, required: true },
    failureReason: String,
  },
  {
    timestamps: true,
  }
);

export const LoginHistory =
  mongoose.models.LoginHistory ||
  mongoose.model("LoginHistory", loginHistorySchema);
