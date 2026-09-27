import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    guestTokenHash: {
      type: String,
      index: true,
      sparse: true,
    },

    method: {
      type: Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },

    transactionId: {
      type: String,
      trim: true,
      sparse: true,
    },

    note: {
      type: String,
      trim: true,
    },

    receipt: {
      type: Schema.Types.ObjectId,
      ref: "Upload",
    },

    idempotencyKey: {
      type: String,
      trim: true,
    },

    idempotencyFingerprint: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

schema.index({ transactionId: 1 }, { unique: true, sparse: true });
schema.index({ order: 1, status: 1 });
schema.index({ user: 1, idempotencyKey: 1 }, { unique: true, sparse: true });
schema.index(
  { guestTokenHash: 1, idempotencyKey: 1 },
  { unique: true, sparse: true }
);

export const Payment = model("Payment", schema);
