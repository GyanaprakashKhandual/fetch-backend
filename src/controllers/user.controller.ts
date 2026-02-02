import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authentication/authentication.service.js";
import { EmailService } from "../services/mail/mail.service.js";
import { generateOTP } from "../utils/crypto.util.js";
import { AppError } from "../utils/error.util.js";

/**
 * Authentication Controller
 * Handles user registration, login, OTP verification, and logout
 */
export class AuthController {
  /**
   * @route   POST /api/auth/register
   * @desc    Register a new user and send OTP for email verification
   * @access  Public
   */
  static async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userName, userEmail, userPassword } = req.body;
      console.log('🔵 [REGISTER] Starting registration for:', userEmail);

      // Register user (creates unverified user with OTP already saved)
      const result = await AuthService.registerUser({
        userName,
        userEmail,
        userPassword,
      });
      console.log('🔵 [REGISTER] User registered successfully:', result);

      // The service already generated and saved the OTP
      // We need to get it from the database to send via email
      const { User } = await import("../models/user.model.js");
      const user = await User.findOne({ userEmail: userEmail.toLowerCase() })
        .select("+emailVerificationToken +emailVerificationExpires");

      if (!user) {
        console.error('❌ [REGISTER] User not found after registration');
        throw new AppError("Registration failed", 500);
      }

      console.log('🔵 [REGISTER] User found with token:', {
        hasToken: !!user.emailVerificationToken,
        tokenExpiry: user.emailVerificationExpires,
      });

      // Generate a NEW OTP for email (since the service hashed the original)
      // This is the issue - we need to send the plain OTP via email
      // But the service already hashed it. We need to fix this flow.
      const { otp, hashedOTP, otpExpiry } = generateOTP();
      
      // Update with the new OTP (so we know what we're sending)
      await User.findOneAndUpdate(
        { userEmail: userEmail.toLowerCase() },
        {
          emailVerificationToken: hashedOTP,
          emailVerificationExpires: otpExpiry,
        }
      );

      console.log('🔵 [REGISTER] New OTP generated and saved:', {
        otp,
        hashedOTP,
        otpExpiry,
      });

      // Send OTP via email
      await EmailService.sendOTPEmail(
        {
          userName,
          otpCode: otp,
          expiresIn: result.otpExpiresIn,
          ipAddress: req.ip,
          location: req.headers["cf-ipcountry"] as string, // Cloudflare header
          device: req.headers["user-agent"],
        },
        userEmail,
      );
      console.log('🔵 [REGISTER] OTP email sent successfully');

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          email: result.email,
          otpExpiresIn: result.otpExpiresIn,
        },
      });
    } catch (error) {
      console.error('❌ [REGISTER] Error:', error);
      next(error);
    }
  }

  /**
   * @route   POST /api/auth/verify-email
   * @desc    Verify email using OTP and complete registration
   * @access  Public
   */
  static async verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, otp } = req.body;
      console.log('🟢 [VERIFY] Starting email verification:', {
        email,
        otp,
      });

      // Check if user exists first
      const { User } = await import("../models/user.model");
      const user = await User.findOne({ userEmail: email.toLowerCase() });
      console.log('🟢 [VERIFY] User found in database:', {
        exists: !!user,
        email: user?.userEmail,
        emailVerificationToken: user?.emailVerificationToken,
        emailVerificationExpires: user?.emailVerificationExpires,
        emailVerified: user?.emailVerified,
      });

      if (!user) {
        console.error('❌ [VERIFY] User not found in database for email:', email);
        throw new AppError("Email not found. Please register again.", 404);
      }

      // Verify OTP and activate user
      const result = await AuthService.verifyEmailOTP({ email, otp });
      console.log('🟢 [VERIFY] OTP verified successfully:', result);

      // Set HTTP-only cookies for persistent login
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "strict" as const,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      res.cookie("accessToken", result.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", result.refreshToken, cookieOptions);

      console.log('🟢 [VERIFY] Verification complete, tokens set');

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      console.error('❌ [VERIFY] Error:', error);
      next(error);
    }
  }

  /**
   * @route   POST /api/auth/resend-otp
   * @desc    Resend OTP for email verification
   * @access  Public
   */
  static async resendOTP(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.body;
      console.log('🟡 [RESEND-OTP] Starting OTP resend for:', email);

      // Resend OTP
      const result = await AuthService.resendVerificationOTP(email);
      console.log('🟡 [RESEND-OTP] Service result:', result);

      // Generate new OTP
      const { otp, hashedOTP, otpExpiry } = generateOTP();
      console.log('🟡 [RESEND-OTP] New OTP generated:', {
        otp,
        hashedOTP,
        otpExpiry,
      });

      // Get user details for email
      const { User } = await import("../models/user.model");
      const user = await User.findOne({ userEmail: email.toLowerCase() });

      if (!user) {
        console.error('❌ [RESEND-OTP] User not found:', email);
        throw new AppError("User not found", 404);
      }
      console.log('🟡 [RESEND-OTP] User found:', user.userEmail);

      // Save new OTP to database
      const updateResult = await User.findOneAndUpdate(
        { userEmail: email.toLowerCase() },
        {
          emailVerificationToken: hashedOTP,
          emailVerificationExpires: otpExpiry,
        },
        { new: true }
      );
      console.log('🟡 [RESEND-OTP] OTP updated in database:', {
        email: updateResult?.userEmail,
        hasToken: !!updateResult?.emailVerificationToken,
        expiresAt: updateResult?.emailVerificationExpires,
      });

      // Send new OTP via email
      await EmailService.sendOTPEmail(
        {
          userName: user.userName,
          otpCode: otp,
          expiresIn: result.otpExpiresIn,
          ipAddress: req.ip,
          location: req.headers["cf-ipcountry"] as string,
          device: req.headers["user-agent"],
        },
        email,
      );
      console.log('🟡 [RESEND-OTP] OTP email sent successfully');

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          otpExpiresIn: result.otpExpiresIn,
        },
      });
    } catch (error) {
      console.error('❌ [RESEND-OTP] Error:', error);
      next(error);
    }
  }

  /**
   * @route   POST /api/auth/login
   * @desc    Login user with email and password
   * @access  Public
   */
  static async login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      // Login user
      const result = await AuthService.loginUser({ email, password });

      // If MFA is required, return early
      if (result.requiresMFA) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            requiresMFA: true,
            userId: result.user._id,
          },
        });
        return;
      }

      // Set HTTP-only cookies for persistent login
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      res.cookie("accessToken", result.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", result.refreshToken, cookieOptions);

      // Send login notification email (async, don't wait)
      EmailService.sendLoginNotification(
        email,
        result.user.userName as string,
        {
          ipAddress: req.ip,
          location: req.headers["cf-ipcountry"] as string,
          device: req.headers["user-agent"],
          timestamp: new Date(),
        },
      ).catch((err) =>
        console.error("Failed to send login notification:", err),
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/auth/logout
   * @desc    Logout user and clear cookies
   * @access  Private
   */
  static async logout(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Get user ID from request (set by auth middleware)
      const userId = (req as any).userId;

      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      // Logout user
      await AuthService.logoutUser(userId);

      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/auth/refresh-token
   * @desc    Refresh access token using refresh token
   * @access  Public (requires valid refresh token)
   */
  static async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        throw new AppError("Refresh token not found", 401);
      }

      // Import token utils
      const { refreshAccessToken } = await import("../utils/token.util");

      // Refresh tokens
      const result = refreshAccessToken(refreshToken);

      // Set new cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
      };

      res.cookie("accessToken", result.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", result.newRefreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: result.accessToken,
          refreshToken: result.newRefreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/auth/me
   * @desc    Get current user details
   * @access  Private
   */
  static async getCurrentUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      // Get user
      const { User } = await import("../models/user.model");
      const user = await User.findById(userId);

      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Update last active
      await User.findByIdAndUpdate(userId, { lastActive: new Date() });

      // Get public profile (handles subscription population)
      const publicProfile = user.toObject ? user.toObject() : user;

      res.status(200).json({
        success: true,
        data: {
          user: publicProfile,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}