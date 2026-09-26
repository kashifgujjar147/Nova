import { Schema, model } from "mongoose";
const schema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  type: { type: String, default: "BANK_TRANSFER", index: true },
  instructions: String, accountNumber: String, accountTitle: String,
  requiresTransactionId: { type: Boolean, default: true },
  requiresReceipt: { type: Boolean, default: false },
  requiresManualReview: { type: Boolean, default: true },
  active: { type: Boolean, default: true, index: true },
  ordering: { type: Number, default: 0 }
}, { timestamps: true });
export const PaymentMethod = model("PaymentMethod", schema);
