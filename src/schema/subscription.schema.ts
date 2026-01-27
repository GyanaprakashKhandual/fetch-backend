import { Schema } from "mongoose";
import { ISubscription } from "../types/subscription.types";

const subscriptionSchema = new Schema<ISubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
      index: true,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      sparse: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["free", "starter", "professional", "enterprise"],
      required: true,
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "cancelled", "expired", "trial", "past_due"],
      required: true,
      default: "trial",
      index: true,
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    trialStart: { type: Date },
    trialEnd: { type: Date },
    cancelAt: { type: Date },
    cancelledAt: { type: Date },
  },
  {
    timestamps: true,
    collection: "subscriptions",
  },
);

// Ensure either user or team is set, but not both at the same time
subscriptionSchema.pre("save", function (next: any) {
  if (!this.user && !this.team) {
    return next(
      new Error("Subscription must belong to either a user or a team"),
    );
  }
  if (this.user && this.team) {
    return next(
      new Error("Subscription cannot belong to both a user and a team"),
    );
  }
  next();
});

// Compound indexes for common queries
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ team: 1, status: 1 });
subscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });

// Instance methods
subscriptionSchema.methods.isActive = function (): boolean {
  return (
    this.status === "active" &&
    (!this.currentPeriodEnd || this.currentPeriodEnd > new Date())
  );
};

subscriptionSchema.methods.isInTrial = function (): boolean {
  return this.status === "trial" && this.trialEnd && this.trialEnd > new Date();
};

subscriptionSchema.methods.willCancel = function (): boolean {
  return !!this.cancelAt && this.cancelAt > new Date();
};

subscriptionSchema.methods.isTeamSubscription = function (): boolean {
  return !!this.team;
};

subscriptionSchema.methods.isIndividualSubscription = function (): boolean {
  return !!this.user;
};

export { subscriptionSchema };
