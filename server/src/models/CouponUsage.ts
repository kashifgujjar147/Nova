import { Schema, model } from "mongoose";
const schema = new Schema({
  coupon: { type: Schema.Types.ObjectId, ref: "Coupon", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  order: { type: Schema.Types.ObjectId, ref: "Order", required: true }
}, { timestamps: true });
schema.index({ coupon: 1, user: 1, order: 1 }, { unique: true });
export const CouponUsage = model("CouponUsage", schema);
