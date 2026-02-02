import nodemailer from "nodemailer";
import { config } from "dotenv";

config();

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
  pool?: boolean;
  maxConnections?: number;
  maxMessages?: number;
}

// Get email configuration from environment variables
const getEmailConfig = (): EmailConfig => {
  const emailService = process.env.EMAIL_SERVICE || "smtp";

  // Common configuration
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASSWORD || "",
    },
    from: {
      name: process.env.EMAIL_FROM_NAME || "Your App Name",
      email: process.env.EMAIL_FROM_ADDRESS || "noreply@yourapp.com",
    },
    pool: true, // Use pooled connections
    maxConnections: 5, // Max simultaneous connections
    maxMessages: 100, // Max messages per connection
  };

  // Service-specific configurations
  switch (emailService.toLowerCase()) {
    case "gmail":
      config.host = "smtp.gmail.com";
      config.port = 587;
      config.secure = false;
      break;

    case "sendgrid":
      config.host = "smtp.sendgrid.net";
      config.port = 587;
      config.secure = false;
      config.auth.user = "apikey";
      break;

    case "mailgun":
      config.host = "smtp.mailgun.org";
      config.port = 587;
      config.secure = false;
      break;

    case "ses":
      // AWS SES configuration
      config.host = `email-smtp.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com`;
      config.port = 587;
      config.secure = false;
      break;

    case "resend":
      config.host = "smtp.resend.com";
      config.port = 587;
      config.secure = false;
      break;

    default:
      // Use custom SMTP from env variables
      break;
  }

  return config;
};

// Create reusable transporter object
const createTransporter = () => {
  const emailConfig = getEmailConfig();

  // Validate required configuration
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    throw new Error(
      "Email configuration is incomplete. Please check your environment variables.",
    );
  }

  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
      user: emailConfig.auth.user,
      pass: emailConfig.auth.pass,
    },
    pool: emailConfig.pool,
    maxConnections: emailConfig.maxConnections,
    maxMessages: emailConfig.maxMessages,
    // Additional security options
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
      minVersion: "TLSv1.2",
    },
    // Connection timeout
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 30000, // 30 seconds
  });

  return transporter;
};

// Singleton transporter instance
let transporter: nodemailer.Transporter | null = null;

// Get or create transporter
export const getTransporter = (): nodemailer.Transporter => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

// Verify transporter connection
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log("✅ Email server connection verified successfully");
    return true;
  } catch (error) {
    console.error("❌ Email server connection failed:", error);
    return false;
  }
};

// Get default from address
export const getDefaultFromAddress = (): { name: string; address: string } => {
  const config = getEmailConfig();
  return {
    name: config.from.name,
    address: config.from.email,
  };
};

// Email rate limiting configuration
export const emailRateLimits = {
  // Maximum emails per user per hour
  maxEmailsPerHour: parseInt(process.env.MAX_EMAILS_PER_HOUR || "10"),
  // Maximum emails per user per day
  maxEmailsPerDay: parseInt(process.env.MAX_EMAILS_PER_DAY || "50"),
  // Cooldown period between verification emails (in milliseconds)
  verificationCooldown: parseInt(
    process.env.VERIFICATION_EMAIL_COOLDOWN || "60000",
  ), // 1 minute
  // Cooldown period between password reset emails (in milliseconds)
  passwordResetCooldown: parseInt(
    process.env.PASSWORD_RESET_COOLDOWN || "300000",
  ), // 5 minutes
};

// Email configuration for different environments
export const emailEnvironmentConfig = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  enableEmailSending: process.env.ENABLE_EMAIL_SENDING !== "false",
  // In development, log emails instead of sending
  logOnly: process.env.EMAIL_LOG_ONLY === "true",
  // Test email address for development
  testEmail: process.env.TEST_EMAIL || "",
};

// Close transporter connection (useful for graceful shutdown)
export const closeEmailConnection = async (): Promise<void> => {
  if (transporter) {
    transporter.close();
    transporter = null;
    console.log("📧 Email connection closed");
  }
};

// Export default configuration
export default {
  getTransporter,
  verifyEmailConnection,
  getDefaultFromAddress,
  emailRateLimits,
  emailEnvironmentConfig,
  closeEmailConnection,
};
