import { Document, Types } from "mongoose";

export interface ISubscription extends Document {
  // Either user OR team must be set (enforced in schema)
  user?: Types.ObjectId;
  team?: Types.ObjectId;

  plan: "free" | "starter" | "professional" | "enterprise";
  status:
    | "active"
    | "inactive"
    | "cancelled"
    | "expired"
    | "trial"
    | "past_due";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  cancelAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
