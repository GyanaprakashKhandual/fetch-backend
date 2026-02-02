import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, extractTokenFromHeader } from "../utils/token.util.js";
import { AppError, AuthenticationError } from "../utils/error.util.js";
import { User } from "../models/user.model.js";

/**
 * Extend Express Request to include userId
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

/**
 * Authentication Middleware
 * Verifies JWT access token and attaches user ID to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from Authorization header first
    let token = extractTokenFromHeader(req.headers.authorization);

    // If not in header, try to get from cookies
    if (!token && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AuthenticationError("Access token is required");
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user exists and is active
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AuthenticationError("User not found");
    }

    if (!user.isActive) {
      throw new AuthenticationError("Account is not active");
    }

    if (user.isSuspended) {
      throw new AuthenticationError("Account is suspended");
    }

    // Attach user ID to request
    req.userId = decoded.userId;
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user ID if token is present, but doesn't fail if not
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token
    let token = extractTokenFromHeader(req.headers.authorization);

    if (!token && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // If no token, just continue without authentication
    if (!token) {
      return next();
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user exists and is active
    const user = await User.findById(decoded.userId);

    if (user && user.isActive && !user.isSuspended) {
      req.userId = decoded.userId;
      req.user = user;
    }

    next();
  } catch (error) {
    // If token verification fails, just continue without authentication
    next();
  }
};

/**
 * Require Email Verification Middleware
 * Ensures user has verified their email
 */
export const requireEmailVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError("User not authenticated");
    }

    if (!req.user.emailVerified) {
      throw new AppError("Email verification required", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require Active Subscription Middleware
 * Ensures user has an active subscription
 */
export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError("User not authenticated");
    }

    const hasActiveSubscription = await req.user.hasActiveSubscription();

    if (!hasActiveSubscription) {
      throw new AppError("Active subscription required", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require MFA Middleware
 * Ensures MFA is enabled for user
 */
export const requireMFA = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError("User not authenticated");
    }

    if (!req.user.mfaEnabled) {
      throw new AppError("MFA is not enabled for this account", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};