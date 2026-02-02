import { Router } from "express";
import { AuthController } from "../controllers/user.controller";
import { validate } from "../middlewares/validation.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import {
  authLimiter,
  strictAuthLimiter,
  otpLimiter,
} from "../middlewares/rate.limit.middleware";
import { authValidationSchemas } from "../validators/user.validator";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  authLimiter, // Rate limit: 5 attempts per 15 minutes
  validate(authValidationSchemas.register),
  AuthController.register,
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with OTP
 * @access  Public
 */
router.post(
  "/verify-email",
  authLimiter, // Rate limit: 5 attempts per 15 minutes
  validate(authValidationSchemas.verifyEmail),
  AuthController.verifyEmail,
);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP for email verification
 * @access  Public
 */
router.post(
  "/resend-otp",
  otpLimiter, // Rate limit: 3 attempts per 5 minutes
  validate(authValidationSchemas.resendOTP),
  AuthController.resendOTP,
);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post(
  "/login",
  authLimiter, // Rate limit: 5 attempts per 15 minutes
  validate(authValidationSchemas.login),
  AuthController.login,
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", authenticate, AuthController.logout);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public (requires valid refresh token)
 */
router.post("/refresh-token", AuthController.refreshToken);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get("/me", authenticate, AuthController.getCurrentUser);

export default router;
