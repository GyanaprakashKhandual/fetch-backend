import { IUser } from "./../../types/user.types.js";
import { User } from "../../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { generateOTP, hashOTP } from "../../utils/crypto.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerificationToken,
} from "../../utils/token.util.js";
import { AppError } from "../../utils/error.util.js";

interface RegisterData {
  userName: string;
  userEmail: string;
  userPassword: string;
}

interface OTPVerificationData {
  email: string;
  otp: string;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user - Step 1: Create unverified user and send OTP
   */
  static async registerUser(data: RegisterData): Promise<{
    userId: string;
    email: string;
    message: string;
    otpExpiresIn: string;
  }> {
    const { userName, userEmail, userPassword } = data;
    console.log('🔵 [SERVICE-REGISTER] Starting registration:', { userName, userEmail });

    // Normalize email
    const normalizedEmail = userEmail.toLowerCase().trim();
    console.log('🔵 [SERVICE-REGISTER] Normalized email:', normalizedEmail);

    // Check if user already exists
    const existingUser = await User.findOne({ userEmail: normalizedEmail });
    console.log('🔵 [SERVICE-REGISTER] Existing user check:', {
      exists: !!existingUser,
      verified: existingUser?.emailVerified,
    });

    if (existingUser && existingUser.emailVerified) {
      console.error('❌ [SERVICE-REGISTER] User already exists and verified');
      throw new AppError("User with this email already exists", 409);
    }

    // If user exists but not verified, delete the old record
    if (existingUser && !existingUser.emailVerified) {
      console.log('🔵 [SERVICE-REGISTER] Deleting old unverified user');
      await User.deleteOne({ _id: existingUser._id });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userPassword, 12);
    console.log('🔵 [SERVICE-REGISTER] Password hashed');

    // Generate OTP (6-digit)
    const { otp, hashedOTP } = generateOTP();
    console.log('🔵 [SERVICE-REGISTER] OTP generated in service:', {
      plainOTP: otp,
      hashedOTP,
    });

    // Set OTP expiration (10 minutes)
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);
    console.log('🔵 [SERVICE-REGISTER] OTP expiration set:', otpExpiration);

    // Create default subscription (you'll need to create this)
    // For now, we'll assume a default subscription exists or create one
    const defaultSubscription = await this.getOrCreateDefaultSubscription();
    console.log('🔵 [SERVICE-REGISTER] Default subscription:', defaultSubscription._id);

    // Create new user (unverified)
    const newUser = await User.create({
      userName,
      userEmail: normalizedEmail,
      userPassword: hashedPassword,
      emailVerified: false,
      emailVerificationToken: hashedOTP,
      emailVerificationExpires: otpExpiration,
      subscription: defaultSubscription._id,
      isActive: false, // User is inactive until email is verified
      team: [],
      projects: [],
      folders: [],
      mfaEnabled: false,
      backupCodes: [],
      isSuspended: false,
    });

    console.log('🔵 [SERVICE-REGISTER] User created successfully:', {
      userId: newUser._id,
      email: newUser.userEmail,
      hasToken: !!newUser.emailVerificationToken,
      tokenExpiry: newUser.emailVerificationExpires,
    });

    return {
      userId: newUser._id.toString(),
      email: normalizedEmail,
      message:
        "OTP sent to your email. Please verify to complete registration.",
      otpExpiresIn: "10 minutes",
    };
  }

  /**
   * Verify OTP and complete registration - Step 2
   */
  static async verifyEmailOTP(data: OTPVerificationData): Promise<{
    user: Partial<IUser>;
    accessToken: string;
    refreshToken: string;
    message: string;
  }> {
    const { email, otp } = data;
    console.log('🟢 [SERVICE-VERIFY] Starting verification:', { email, otp });

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log('🟢 [SERVICE-VERIFY] Normalized email:', normalizedEmail);

    // Find user by email (regardless of verification status for debugging)
    let user = await User.findOne({
      userEmail: normalizedEmail,
    }).select("+emailVerificationToken +emailVerificationExpires");

    console.log('🟢 [SERVICE-VERIFY] User lookup result:', {
      found: !!user,
      email: user?.userEmail,
      hasToken: !!user?.emailVerificationToken,
      tokenExpiry: user?.emailVerificationExpires,
      isVerified: user?.emailVerified,
      isActive: user?.isActive,
    });

    if (!user) {
      console.error('❌ [SERVICE-VERIFY] User not found for email:', normalizedEmail);
      throw new AppError(`User with email ${normalizedEmail} not found. Please register first.`, 400);
    }

    // Check if already verified
    if (user.emailVerified) {
      console.error('❌ [SERVICE-VERIFY] Email already verified');
      throw new AppError("Email is already verified. Please login instead.", 400);
    }

    // Check if OTP is expired
    if (
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      console.error('❌ [SERVICE-VERIFY] OTP expired:', {
        expiry: user.emailVerificationExpires,
        now: new Date(),
      });
      throw new AppError("OTP has expired. Please request a new one.", 400);
    }

    console.log('🟢 [SERVICE-VERIFY] Comparing OTP:', {
      providedOTP: otp,
      hashedToken: user.emailVerificationToken,
    });

    // Verify OTP
    const isOTPValid = await bcrypt.compare(
      otp,
      user.emailVerificationToken || "",
    );

    console.log('🟢 [SERVICE-VERIFY] OTP validation result:', isOTPValid);

    if (!isOTPValid) {
      console.error('❌ [SERVICE-VERIFY] Invalid OTP');
      throw new AppError("Invalid OTP. Please try again.", 400);
    }

    // Update user - mark as verified and active
    user.emailVerified = true;
    user.isActive = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.lastLoginAt = new Date();
    user.lastActiveAt = new Date();

    await user.save();
    console.log('🟢 [SERVICE-VERIFY] User updated and verified successfully');

    // Generate tokens for persistent login
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    console.log('🟢 [SERVICE-VERIFY] Tokens generated');

    // Get public profile
    const publicProfile = user.toObject ? user.toObject() : user;

    return {
      user: publicProfile,
      accessToken,
      refreshToken,
      message: "Email verified successfully! Welcome aboard!",
    };
  }

  /**
   * Resend OTP for email verification
   */
  static async resendVerificationOTP(email: string): Promise<{
    message: string;
    otpExpiresIn: string;
  }> {
    const normalizedEmail = email.toLowerCase().trim();
    console.log('🟡 [SERVICE-RESEND] Starting resend for:', normalizedEmail);

    // Find unverified user
    const user = await User.findOne({
      userEmail: normalizedEmail,
      emailVerified: false,
    }).select("+emailVerificationExpires");

    console.log('🟡 [SERVICE-RESEND] User lookup result:', {
      found: !!user,
      email: user?.userEmail,
      hasExpiry: !!user?.emailVerificationExpires,
    });

    if (!user) {
      console.error('❌ [SERVICE-RESEND] No pending verification found');
      throw new AppError("No pending verification found for this email", 404);
    }

    // Check rate limiting (prevent spam)
    if (user.emailVerificationExpires) {
      const timeSinceLastOTP =
        Date.now() - (user.emailVerificationExpires.getTime() - 10 * 60 * 1000);
      const cooldownPeriod = 60 * 1000; // 1 minute cooldown

      if (timeSinceLastOTP < cooldownPeriod) {
        const remainingTime = Math.ceil(
          (cooldownPeriod - timeSinceLastOTP) / 1000,
        );
        console.error('❌ [SERVICE-RESEND] Rate limit hit:', remainingTime, 'seconds remaining');
        throw new AppError(
          `Please wait ${remainingTime} seconds before requesting a new OTP`,
          429,
        );
      }
    }

    // Generate new OTP
    const { otp, hashedOTP } = generateOTP();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);
    console.log('🟡 [SERVICE-RESEND] New OTP generated:', {
      plainOTP: otp,
      hashedOTP,
      expiry: otpExpiration,
    });

    // Update user
    user.emailVerificationToken = hashedOTP;
    user.emailVerificationExpires = otpExpiration;
    await user.save();
    console.log('🟡 [SERVICE-RESEND] User updated with new OTP');

    return {
      message: "New OTP sent to your email",
      otpExpiresIn: "10 minutes",
    };
  }

  /**
   * Traditional login with email and password
   */
  static async loginUser(data: LoginData): Promise<{
    user: Partial<IUser>;
    accessToken: string;
    refreshToken: string;
    requiresMFA: boolean;
    message: string;
  }> {
    const { email, password } = data;

    // Find user and include password for verification
    const user = await User.findOne({
      userEmail: email.toLowerCase().trim(),
    })
      .select("+userPassword")
      .populate("subscription");

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(
        "Account is not active. Please verify your email.",
        403,
      );
    }

    // Check if user is suspended
    if (user.isSuspended) {
      throw new AppError(
        `Account is suspended. Reason: ${user.suspendedReason || "Contact support"}`,
        403,
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.userPassword);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      // Return indicator that MFA is required
      // The actual MFA verification will be handled in a separate endpoint
      return {
        user: { _id: user._id, userEmail: user.userEmail },
        accessToken: "",
        refreshToken: "",
        requiresMFA: true,
        message: "MFA verification required",
      };
    }

    // Update last login
    user.lastLoginAt = new Date();
    user.lastActiveAt = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Get public profile
    const publicProfile = user.toObject ? user.toObject() : user;

    return {
      user: publicProfile,
      accessToken,
      refreshToken,
      requiresMFA: false,
      message: "Login successful",
    };
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // This will be implemented in token.utils.ts
    // For now, placeholder
    throw new AppError("Refresh token functionality not yet implemented", 501);
  }

  /**
   * Logout user
   */
  static async logoutUser(userId: string): Promise<{ message: string }> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Update last active
    user.lastActiveAt = new Date();
    await user.save();

    return {
      message: "Logged out successfully",
    };
  }

  /**
   * Get or create default subscription
   * @private
   */
  private static async getOrCreateDefaultSubscription() {
    // Import Subscription model
    const { Subscription } = await import("../../models/subscription.model.js");

    // Check if default free subscription exists
    let defaultSubscription = await Subscription.findOne({
      plan: "free",
    });

    // If not, create it
    if (!defaultSubscription) {
      defaultSubscription = await Subscription.create({
        plan: "free",
        status: "active",
        currentPeriodStart: new Date(),
        // No end date for free plan
      });
    }

    return defaultSubscription;
  }

  /**
   * Get OTP for sending via email (only during registration/resend)
   * This should ONLY be used internally to send the OTP via email
   */
  static getPlainOTP(): string {
    // This is a helper that returns the last generated OTP
    // In production, you'd store this temporarily in Redis or return it from generateOTP
    throw new AppError("This method should not be called directly", 500);
  }
}