import { z } from "zod";

/**
 * Password validation regex
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Registration Schema
 */
export const registerSchema = z.object({
  body: z
    .object({
      userName: z
        .string({
          required_error: "Username is required",
        })
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username must not exceed 50 characters")
        .regex(
          /^[a-zA-Z0-9_-]+$/,
          "Username can only contain letters, numbers, underscores, and hyphens",
        ),

      userEmail: z
        .string({
          required_error: "Email is required",
        })
        .email("Invalid email address")
        .toLowerCase()
        .trim(),

      userPassword: z
        .string({
          required_error: "Password is required",
        })
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must not exceed 128 characters")
        .regex(
          passwordRegex,
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        ),

      confirmPassword: z.string({
        required_error: "Confirm password is required",
      }),
    })
    .refine((data) => data.userPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

/**
 * Email Verification Schema
 */
export const verifyEmailSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email address")
      .toLowerCase()
      .trim(),

    otp: z
      .string({
        required_error: "OTP is required",
      })
      .length(6, "OTP must be 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only numbers"),
  }),
});

/**
 * Resend OTP Schema
 */
export const resendOTPSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
  }),
});

/**
 * Login Schema
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email address")
      .toLowerCase()
      .trim(),

    password: z
      .string({
        required_error: "Password is required",
      })
      .min(1, "Password is required"),
  }),
});

/**
 * Refresh Token Schema
 */
export const refreshTokenSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: "Refresh token is required",
    }),
  }),
});

/**
 * Change Password Schema
 */
export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string({
          required_error: "Current password is required",
        })
        .min(1, "Current password is required"),

      newPassword: z
        .string({
          required_error: "New password is required",
        })
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must not exceed 128 characters")
        .regex(
          passwordRegex,
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        ),

      confirmNewPassword: z.string({
        required_error: "Confirm new password is required",
      }),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "Passwords do not match",
      path: ["confirmNewPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: "New password must be different from current password",
      path: ["newPassword"],
    }),
});

/**
 * Forgot Password Schema
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
  }),
});

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string({
        required_error: "Reset token is required",
      }),

      newPassword: z
        .string({
          required_error: "New password is required",
        })
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must not exceed 128 characters")
        .regex(
          passwordRegex,
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        ),

      confirmNewPassword: z.string({
        required_error: "Confirm new password is required",
      }),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "Passwords do not match",
      path: ["confirmNewPassword"],
    }),
});

/**
 * Magic Link Request Schema
 */
export const magicLinkRequestSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
  }),
});

/**
 * Magic Link Verify Schema
 */
export const magicLinkVerifySchema = z.object({
  query: z.object({
    token: z.string({
      required_error: "Magic link token is required",
    }),
  }),
});

/**
 * MFA Verification Schema
 */
export const mfaVerificationSchema = z.object({
  body: z.object({
    userId: z.string({
      required_error: "User ID is required",
    }),

    code: z
      .string({
        required_error: "MFA code is required",
      })
      .length(6, "MFA code must be 6 digits")
      .regex(/^\d{6}$/, "MFA code must contain only numbers"),
  }),
});

/**
 * Export all schemas
 */
export const authValidationSchemas = {
  register: registerSchema,
  verifyEmail: verifyEmailSchema,
  resendOTP: resendOTPSchema,
  login: loginSchema,
  refreshToken: refreshTokenSchema,
  changePassword: changePasswordSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  magicLinkRequest: magicLinkRequestSchema,
  magicLinkVerify: magicLinkVerifySchema,
  mfaVerification: mfaVerificationSchema,
};
