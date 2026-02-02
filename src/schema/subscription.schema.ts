import { Schema } from "mongoose";
import { ISubscription } from "../types/subscription.types";

const subscriptionSchema = new Schema<ISubscription>(
  {
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "cancelled", "expired"],
      default: "active",
      required: true,
    },
    currentPeriodStart: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "subscriptions",
  }
);

subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ isDefault: 1 });

export { subscriptionSchema };