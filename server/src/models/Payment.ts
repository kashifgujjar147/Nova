import { Schema, model } from "mongoose";
const schema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  method: { type: Schema.Types.ObjectId, ref: "PaymentMethod", required: true },
  amount: { type: Number, required: true, min: 0 },
  transactionId: { type: String, trim: true },
  paymentTime: Date,
  receiptUrl: String,
  note: String,
  status: { type: String, enum: ["PENDING","UNDER_REVIEW","APPROVED","REJECTED","REFUNDED"], default: "PENDING", index: true },
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date,
  idempotencyKey: { type: String, trim: true },
  idempotencyFingerprint: { type: String, trim: true }
}, { timestamps: true });
schema.index({ transactionId: 1 }, { unique: true, sparse: true });
schema.index({ order: 1, status: 1 });schema.index({ user:1, idempotencyKey:1 },{unique:true,sparse:true});
export const Payment = model("Payment", schema);


