import { Schema, model } from "mongoose";
const schema = new Schema({
  code: { type: String, unique: true, index: true, uppercase: true, trim: true },
  type: { type: String, enum: ["percentage","fixed"], required: true },
  value: { type: Number, required: true, min: 0 },
  minOrder: { type: Number, default: 0, min: 0 },
  maxDiscount: { type: Number, min: 0 },
  startsAt: Date,
  expiresAt: Date,
  usageLimit: { type: Number, min: 1 },
  perUserLimit: { type: Number, min: 1 },
  usedCount: { type: Number, default: 0, min: 0 },
  products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  active: { type: Boolean, default: true }
}, { timestamps: true });
export const Coupon = model("Coupon", schema);
