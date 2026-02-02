import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { AppError } from "./error.util";

config();

// JWT Configuration
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d"; // 7 days

// Validate secrets
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error(
    "JWT secrets are not configured. Please set ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET in environment variables.",
  );
}

/**
 * JWT Payload Interface
 */
interface JWTPayload {
  userId: string;
  type: "access" | "refresh";
  iat?: number;
  exp?: number;
}

/**
 * Generate Access Token
 */
export const generateAccessToken = (userId: string): string => {
  const payload: JWTPayload = {
    userId,
    type: "access",
  };

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: "your-app-name",
    audience: "your-app-users",
  });
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (userId: string): string => {
  const payload: JWTPayload = {
    userId,
    type: "refresh",
  };

  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: "your-app-name",
    audience: "your-app-users",
  });
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
      issuer: "your-app-name",
      audience: "your-app-users",
    }) as JWTPayload;

    if (decoded.type !== "access") {
      throw new AppError("Invalid token type", 401);
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Access token has expired", 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid access token", 401);
    }
    throw error;
  }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: "your-app-name",
      audience: "your-app-users",
    }) as JWTPayload;

    if (decoded.type !== "refresh") {
      throw new AppError("Invalid token type", 401);
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Refresh token has expired. Please login again.", 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid refresh token", 401);
    }
    throw error;
  }
};

/**
 * Decode Token Without Verification (for debugging)
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Generate Email Verification Token (not JWT, just a random token)
 */
export const generateEmailVerificationToken = (): string => {
  const crypto = require("crypto");
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Generate Password Reset Token
 */
export const generatePasswordResetToken = (): string => {
  const crypto = require("crypto");
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Get Token Expiry Time
 */
export const getTokenExpiryTime = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if Token is Expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (decoded && decoded.exp) {
      return Date.now() >= decoded.exp * 1000;
    }
    return true;
  } catch (error) {
    return true;
  }
};

/**
 * Refresh Access Token using Refresh Token
 */
export const refreshAccessToken = (
  refreshToken: string,
): { accessToken: string; newRefreshToken: string } => {
  // Verify the refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Generate new access token
  const accessToken = generateAccessToken(decoded.userId);

  // Optional: Implement refresh token rotation for enhanced security
  const newRefreshToken = generateRefreshToken(decoded.userId);

  return { accessToken, newRefreshToken };
};

/**
 * Extract Token from Authorization Header
 */
export const extractTokenFromHeader = (
  authHeader: string | undefined,
): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
};

/**
 * Get Token Configuration Info
 */
export const getTokenConfig = () => {
  return {
    accessTokenExpiry: ACCESS_TOKEN_EXPIRY,
    refreshTokenExpiry: REFRESH_TOKEN_EXPIRY,
  };
};
