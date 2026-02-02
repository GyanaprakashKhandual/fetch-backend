import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      rateLimit?: {
        limit: number;
        current: number;
        remaining: number;
        resetTime?: number;
      };
    }
  }
}

/**
 * General API Rate Limiter
 * 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Authentication Rate Limiter
 * 5 login/register attempts per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message:
    "Too many authentication attempts, please try again after 15 minutes.",
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message:
        "Too many authentication attempts. Please try again after 15 minutes.",
      retryAfter: Math.ceil((req.rateLimit?.resetTime ?? 900) / 1000),
    });
  },
});

/**
 * Strict Authentication Rate Limiter
 * For sensitive operations like password reset
 * 3 attempts per hour
 */
export const strictAuthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: "Too many attempts, please try again after 1 hour.",
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Too many attempts. Please try again after 1 hour.",
      retryAfter: Math.ceil((req.rateLimit?.resetTime ?? 3600) / 1000),
    });
  },
});

/**
 * OTP Request Rate Limiter
 * 3 OTP requests per 5 minutes
 */
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 OTP requests per 5 minutes
  message: "Too many OTP requests, please try again later.",
  skipSuccessfulRequests: false, // Count all requests
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Too many OTP requests. Please try again after 5 minutes.",
      retryAfter: Math.ceil((req.rateLimit?.resetTime ?? 300) / 1000),
    });
  },
});

/**
 * Email Rate Limiter
 * 10 emails per hour
 */
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 email requests per hour
  message: "Too many email requests, please try again later.",
  skipSuccessfulRequests: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Too many email requests. Please try again after 1 hour.",
      retryAfter: Math.ceil((req.rateLimit?.resetTime ?? 3600) / 1000),
    });
  },
});

/**
 * Create Custom Rate Limiter
 */
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || "Too many requests, please try again later.",
    skipSuccessfulRequests: options.skipSuccessfulRequests ?? true,
    standardHeaders: true,
    legacyHeaders: false,
  });
};
