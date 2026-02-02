export interface OTPEmailParams {
  userName: string;
  otpCode: string;
  expiresIn: string; // e.g., "10 minutes"
  ipAddress?: string;
  location?: string;
  device?: string;
}

export const otpVerificationTemplate = (params: OTPEmailParams): string => {
  const { userName, otpCode, expiresIn, ipAddress, location, device } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 20px;
      color: #333333;
      margin-bottom: 20px;
      font-weight: 500;
    }
    .message {
      font-size: 16px;
      color: #666666;
      margin-bottom: 30px;
      line-height: 1.8;
    }
    .otp-container {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
      border: 2px solid #667eea;
    }
    .otp-label {
      font-size: 14px;
      color: #666666;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    .otp-code {
      font-size: 48px;
      font-weight: 700;
      color: #667eea;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
      margin: 10px 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }
    .otp-expiry {
      font-size: 13px;
      color: #999999;
      margin-top: 15px;
    }
    .warning-box {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .warning-box h3 {
      font-size: 16px;
      color: #856404;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
    }
    .warning-box p {
      font-size: 14px;
      color: #856404;
      margin: 5px 0;
      line-height: 1.6;
    }
    .security-info {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .security-info h3 {
      font-size: 16px;
      color: #333333;
      margin-bottom: 15px;
      font-weight: 600;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
      font-size: 14px;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #666666;
      font-weight: 500;
    }
    .info-value {
      color: #333333;
      font-weight: 600;
      text-align: right;
    }
    .not-you-box {
      background-color: #fee;
      border: 1px solid #fcc;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      text-align: center;
    }
    .not-you-box p {
      font-size: 14px;
      color: #c33;
      margin-bottom: 15px;
    }
    .not-you-box a {
      display: inline-block;
      padding: 10px 25px;
      background-color: #dc3545;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }
    .footer p {
      font-size: 13px;
      color: #999999;
      margin-bottom: 8px;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .otp-code {
        font-size: 36px;
        letter-spacing: 6px;
      }
      .info-row {
        flex-direction: column;
      }
      .info-value {
        text-align: left;
        margin-top: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>🔐 Verification Code</h1>
      <p>Secure login authentication</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hello ${userName},</p>
      
      <p class="message">
        We received a login attempt to your account. To complete the sign-in process, please use the verification code below:
      </p>

      <!-- OTP Code Display -->
      <div class="otp-container">
        <div class="otp-label">Your Verification Code</div>
        <div class="otp-code">${otpCode}</div>
        <div class="otp-expiry">⏰ This code will expire in ${expiresIn}</div>
      </div>

      <!-- Security Information -->
      <div class="security-info">
        <h3>Login Attempt Details</h3>
        ${ipAddress ? `
        <div class="info-row">
          <span class="info-label">IP Address:</span>
          <span class="info-value">${ipAddress}</span>
        </div>` : ''}
        ${location ? `
        <div class="info-row">
          <span class="info-label">Location:</span>
          <span class="info-value">${location}</span>
        </div>` : ''}
        ${device ? `
        <div class="info-row">
          <span class="info-label">Device:</span>
          <span class="info-value">${device}</span>
        </div>` : ''}
        <div class="info-row">
          <span class="info-label">Time:</span>
          <span class="info-value">${new Date().toLocaleString()}</span>
        </div>
      </div>

      <!-- Warning Box -->
      <div class="warning-box">
        <h3>⚠️ Security Reminder</h3>
        <p>• Never share this code with anyone, including our support team</p>
        <p>• We will never ask you for this code via phone or email</p>
        <p>• This code is valid for one-time use only</p>
        <p>• Do not forward this email to anyone</p>
      </div>

      <!-- Not You Section -->
      <div class="not-you-box">
        <p><strong>Didn't try to log in?</strong></p>
        <p>If you didn't attempt to sign in, your account may be compromised. Secure your account immediately.</p>
        <a href="#">Secure My Account</a>
      </div>

      <p class="message" style="margin-top: 30px; font-size: 14px; text-align: center;">
        Need help? <a href="#" style="color: #667eea;">Contact our support team</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>This is an automated security message from Your App Name</p>
      <p>© ${new Date().getFullYear()} Your App Name. All rights reserved.</p>
      <p>
        <a href="#">Privacy Policy</a> • 
        <a href="#">Security Center</a> • 
        <a href="#">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
};