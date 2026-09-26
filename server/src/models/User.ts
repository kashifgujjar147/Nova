import { Schema, model } from "mongoose";
const schema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, trim: true, maxlength: 40 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["customer", "affiliate", "admin", "super_admin"], default: "customer", index: true },
  active: { type: Boolean, default: true, index: true },
  affiliateEnabled: { type: Boolean, default: true },
  affiliateCode: { type: String, unique: true, sparse: true, uppercase: true, index: true },
  profilePicture: String,
  emailVerified: { type: Boolean, default: false },
  resetToken: String,
  resetExpires: Date
}, { timestamps: true });
export const User = model("User", schema);
