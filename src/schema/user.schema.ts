import { Schema } from "mongoose";
import { IUser } from "../types/user.types.js";

const userSchema = new Schema<IUser>(
  {
    userName: {
      type: String,
      required: [true, "Username is required"],
      index: true,
    },
    userEmail: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      index: true,
    },
    userAvatar: {
      type: String,
      default: null,
    },
    userPassword: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    team: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    projects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    folders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Folder",
      },
    ],
    emailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    lastLoginAt: {
      type: Date,
    },
    lastActiveAt: {
      type: Date,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    mfaEnabled: {
      type: Boolean,
      default: false,
      index: true,
    },
    mfaSecret: {
      type: String,
      select: false,
    },
    backupCodes: {
      type: [String],
      default: [],
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
      index: true,
    },
    suspendedReason: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

userSchema.index({ userEmail: 1, isActive: 1 });
userSchema.index({ emailVerified: 1, isActive: 1 });
userSchema.index({ userName: "text", userEmail: "text" });

userSchema.methods.hasActiveSubscription = async function (): Promise<boolean> {
  await this.populate("subscription");
  return (
    this.subscription?.status === "active" &&
    (!this.subscription.currentPeriodEnd ||
      this.subscription.currentPeriodEnd > new Date())
  );
};

userSchema.methods.isSubscriptionExpired = async function (): Promise<boolean> {
  await this.populate("subscription");
  return (
    this.subscription?.currentPeriodEnd !== undefined &&
    this.subscription.currentPeriodEnd < new Date()
  );
};

userSchema.methods.getPublicProfile = async function () {
  await this.populate("subscription");
  return {
    id: this._id,
    userName: this.userName,
    userEmail: this.userEmail,
    userAvatar: this.userAvatar,
    emailVerified: this.emailVerified,
    subscription: this.subscription
      ? {
          plan: this.subscription.plan,
          status: this.subscription.status,
        }
      : null,
    mfaEnabled: this.mfaEnabled,
    createdAt: this.createdAt,
  };
};

userSchema.methods.updateLastActive = async function () {
  this.lastActiveAt = new Date();
  return this.save({ validateBeforeSave: false });
};

userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ userEmail: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true, isSuspended: false });
};

export { userSchema };
