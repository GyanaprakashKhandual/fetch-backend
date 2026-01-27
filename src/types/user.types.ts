import { Document, Types } from "mongoose";

export interface IUser extends Document {
  userName: string;
  userEmail: string;
  userAvatar?: string;
  userPassword: string;
  team: Types.ObjectId[];
  projects: Types.ObjectId[];
  folders: Types.ObjectId[];
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  lastLoginAt?: Date;
  lastActiveAt?: Date;
  subscription: Types.ObjectId;
  mfaEnabled: boolean;
  mfaSecret?: string;
  backupCodes: string[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isActive: boolean;
  isSuspended: boolean;
  suspendedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
