import crypto from "crypto";
import bcrypt from "bcrypt";

/**
 * Generate a 6-digit OTP and its hashed version
 */
export const generateOTP = (): { otp: string; hashedOTP: string } => {
  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Hash the OTP for storage
  const hashedOTP = bcrypt.hashSync(otp, 10);

  return { otp, hashedOTP };
};

/**
 * Hash OTP using bcrypt
 */
export const hashOTP = async (otp: string): Promise<string> => {
  return bcrypt.hash(otp, 10);
};

/**
 * Verify OTP against hash
 */
export const verifyOTP = async (
  otp: string,
  hashedOTP: string,
): Promise<boolean> => {
  return bcrypt.compare(otp, hashedOTP);
};

/**
 * Generate a secure random token (for email verification, password reset, etc.)
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Hash a token using SHA-256
 */
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Generate backup codes for MFA
 */
export const generateBackupCodes = (
  count: number = 10,
): { codes: string[]; hashedCodes: string[] } => {
  const codes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(code);

    // Hash the code for storage
    const hashedCode = bcrypt.hashSync(code, 10);
    hashedCodes.push(hashedCode);
  }

  return { codes, hashedCodes };
};

/**
 * Verify backup code
 */
export const verifyBackupCode = async (
  code: string,
  hashedCodes: string[],
): Promise<{ isValid: boolean; matchedIndex: number }> => {
  for (let i = 0; i < hashedCodes.length; i++) {
    const isMatch = await bcrypt.compare(code, hashedCodes[i]);
    if (isMatch) {
      return { isValid: true, matchedIndex: i };
    }
  }
  return { isValid: false, matchedIndex: -1 };
};

/**
 * Generate a cryptographically secure random string
 */
export const generateRandomString = (length: number = 32): string => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
};

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate HMAC signature
 */
export const generateHMAC = (data: string, secret: string): string => {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
};

/**
 * Verify HMAC signature
 */
export const verifyHMAC = (
  data: string,
  signature: string,
  secret: string,
): boolean => {
  const expectedSignature = generateHMAC(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
};

/**
 * Generate a time-limited token (for magic links)
 */
export const generateTimeLimitedToken = (): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} => {
  const token = generateSecureToken(32);
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  return { token, hashedToken, expiresAt };
};

/**
 * Generate device fingerprint (for session management)
 */
export const generateDeviceFingerprint = (
  userAgent: string,
  ip: string,
): string => {
  const data = `${userAgent}|${ip}`;
  return crypto.createHash("sha256").update(data).digest("hex");
};
