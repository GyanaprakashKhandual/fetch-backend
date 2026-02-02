import { model } from "mongoose";
import { ISubscription } from "../types/subscription.types.js";
import { subscriptionSchema } from "../schema/subscription.schema.js";

export const Subscription = model<ISubscription>(
  "Subscription",
  subscriptionSchema,
);
