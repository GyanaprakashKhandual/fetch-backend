import { welcomeEmailTemplate } from "./../../templates/mail/welcome.template.js";
import { otpVerificationTemplate } from "./../../templates/mail/otp.verification.template.js";
import { oauthLinkTemplate } from "./../../templates/mail/oauth.template.js";
import { magicLinkTemplate } from "./../../templates/mail/mail.verification.template.js";
import {
  getTransporter,
  getDefaultFromAddress,
} from "../../configs/mail.config.js";
import { AppError } from "../../utils/error.util.js";
import { WelcomeEmailParams } from "../../templates/mail/index.js";
import { OTPEmailParams } from "../../templates/mail/index.js";
import { OAuthLinkEmailParams } from "../../templates/mail/index.js";
import { MagicLinkEmailParams } from "../../templates/mail/index.js";

/**
 * Email Service for sending various types of emails
 */
export class EmailService {
  /**
   * Send Welcome Email with Verification Link
   */
  static async sendWelcomeEmail(
    params: WelcomeEmailParams,
    to: string,
  ): Promise<void> {
    try {
      const transporter = getTransporter();
      const { name, address } = getDefaultFromAddress();

      const htmlContent = welcomeEmailTemplate(params);

      await transporter.sendMail({
        from: `"${name}" <${address}>`,
        to,
        subject: "Welcome! Verify your email address",
        html: htmlContent,
      });

      console.log(`✅ Welcome email sent to ${to}`);
    } catch (error) {
      console.error("❌ Error sending welcome email:", error);
      throw new AppError("Failed to send welcome email", 500);
    }
  }

  /**
   * Send OTP Verification Email
   */
  static async sendOTPEmail(params: OTPEmailParams, to: string): Promise<void> {
    try {
      const transporter = getTransporter();
      const { name, address } = getDefaultFromAddress();

      const htmlContent = otpVerificationTemplate(params);

      await transporter.sendMail({
        from: `"${name}" <${address}>`,
        to,
        subject: `Your verification code: ${params.otpCode}`,
        html: htmlContent,
      });

      console.log(`✅ OTP email sent to ${to}`);
    } catch (error) {
      console.error("❌ Error sending OTP email:", error);
      throw new AppError("Failed to send OTP email", 500);
    }
  }

  /**
   * Send OAuth Link Notification Email
   */
  static async sendOAuthLinkEmail(
    params: OAuthLinkEmailParams,
    to: string,
  ): Promise<void> {
    try {
      const transporter = getTransporter();
      const { name, address } = getDefaultFromAddress();

      const htmlContent = oauthLinkTemplate(params);

      const subject = params.wasLinked
        ? `${params.provider} account linked successfully`
        : `New login from ${params.provider}`;

      await transporter.sendMail({
        from: `"${name}" <${address}>`,
        to,
        subject,
        html: htmlContent,
      });

      console.log(`✅ OAuth link email sent to ${to}`);
    } catch (error) {
      console.error("❌ Error sending OAuth link email:", error);
      throw new AppError("Failed to send OAuth notification email", 500);
    }
  }

  /**
   * Send Magic Link Email
   */
  static async sendMagicLinkEmail(
    params: MagicLinkEmailParams,
    to: string,
  ): Promise<void> {
    try {
      const transporter = getTransporter();
      const { name, address } = getDefaultFromAddress();

      const htmlContent = magicLinkTemplate(params);

      await transporter.sendMail({
        from: `"${name}" <${address}>`,
        to,
        subject: "Your magic login link",
        html: htmlContent,
      });

      console.log(`✅ Magic link email sent to ${to}`);
    } catch (error) {
      console.error("❌ Error sending magic link email:", error);
      throw new AppError("Failed to send magic link email", 500);
    }
  }

  /**
   * Send Password Reset Email
   */
  static async sendPasswordResetEmail(
    email: string,
    resetLink: string,
    userName: string,
  ): Promise<void> {
    try {
      const transporter = getTransporter();
      const { name, address } = getDefaultFromAddress();

      // You can create a separate template for this
      const htmlContent = `
        <h1>Password Reset Request</h1>
        <p>Hello ${userName},</p>
        <p>You requested to reset your password. Click the link below:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `;

      await transporter.sendMail({
        from: `"${name}" <${address}>`,
        to: email,
        subject: "Password Reset Request",
        html: htmlContent,
      });

      console.log(`✅ Password reset email sent to ${email}`);
    } catch (error) {
      console.error("❌ Error sending password reset email:", error);
      throw new AppError("Failed to send password reset email", 500);
    }
  }

  /**
   * Send Login Notification Email (New Device/Location)
   */
  static async sendLoginNotification(
    email: string,
    userName: string,
    loginDetails: {
      ipAddress?: string;
      location?: string;
      device?: string;
      timestamp: Date;
    },
  ): Promise<void> {
    try {
      const transporter = getTransporter();
      const { name, address } = getDefaultFromAddress();

      const htmlContent = `
        <h1>New Login Detected</h1>
        <p>Hello ${userName},</p>
        <p>We detected a new login to your account:</p>
        <ul>
          <li>Time: ${loginDetails.timestamp.toLocaleString()}</li>
          ${loginDetails.ipAddress ? `<li>IP Address: ${loginDetails.ipAddress}</li>` : ""}
          ${loginDetails.location ? `<li>Location: ${loginDetails.location}</li>` : ""}
          ${loginDetails.device ? `<li>Device: ${loginDetails.device}</li>` : ""}
        </ul>
        <p>If this wasn't you, please secure your account immediately.</p>
      `;

      await transporter.sendMail({
        from: `"${name}" <${address}>`,
        to: email,
        subject: "New Login to Your Account",
        html: htmlContent,
      });

      console.log(`✅ Login notification sent to ${email}`);
    } catch (error) {
      console.error("❌ Error sending login notification:", error);
      // Don't throw error here, as login notification is not critical
    }
  }

  /**
   * Send Account Suspended Notification
   */
  static async sendAccountSuspendedEmail(
    email: string,
    userName: string,
    reason: string,
  ): Promise<void> {
    try {
      const transporter = getTransporter();
      const { name, address } = getDefaultFromAddress();

      const htmlContent = `
        <h1>Account Suspended</h1>
        <p>Hello ${userName},</p>
        <p>Your account has been suspended.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>If you believe this is a mistake, please contact our support team.</p>
      `;

      await transporter.sendMail({
        from: `"${name}" <${address}>`,
        to: email,
        subject: "Account Suspended",
        html: htmlContent,
      });

      console.log(`✅ Account suspended email sent to ${email}`);
    } catch (error) {
      console.error("❌ Error sending account suspended email:", error);
    }
  }
}
