import { Document } from "mongoose";

export interface ISubscription extends Document {
  plan: "free" | "pro" | "enterprise";
  status: "active" | "inactive" | "cancelled" | "expired";
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}