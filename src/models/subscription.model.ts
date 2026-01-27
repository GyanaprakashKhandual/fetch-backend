import { model } from "mongoose";
import { ISubscription } from "../types/subscription.types";
import { subscriptionSchema } from "../schema/subscription.schema";

export const Subscription = model<ISubscription>(
  "Subscription",
  subscriptionSchema,
);
