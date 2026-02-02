interface MagicLinkEmailParams {
  userName?: string; // Optional for cases where user hasn't set a username yet
  userEmail: string;
  magicLink: string;
  expiresIn: string; // e.g., "15 minutes"
  ipAddress?: string;
  location?: string;
  device?: string;
}

export const magicLinkTemplate = (params: MagicLinkEmailParams): string => {
  const { userName, userEmail, magicLink, expiresIn, ipAddress, location, device } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Magic Login Link</title>
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
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
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
    .magic-icon {
      font-size: 64px;
      margin-bottom: 15px;
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
    .highlight-box {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 12px;
      padding: 25px;
      text-align: center;
      margin: 30px 0;
      border: 2px solid #11998e;
    }
    .highlight-box p {
      font-size: 14px;
      color: #666666;
      margin-bottom: 10px;
    }
    .highlight-box .email-display {
      font-size: 16px;
      font-weight: 600;
      color: #11998e;
      background-color: #ffffff;
      padding: 10px 20px;
      border-radius: 6px;
      display: inline-block;
      margin: 10px 0;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .magic-button {
      display: inline-block;
      padding: 18px 45px;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(17, 153, 142, 0.3);
    }
    .magic-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(17, 153, 142, 0.4);
    }
    .timer-box {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 15px;
      margin: 25px 0;
      text-align: center;
    }
    .timer-box p {
      font-size: 14px;
      color: #856404;
      margin: 0;
    }
    .timer-icon {
      font-size: 24px;
      margin-bottom: 5px;
    }
    .alternative-link {
      margin-top: 25px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #11998e;
    }
    .alternative-link p {
      font-size: 14px;
      color: #666666;
      margin-bottom: 10px;
    }
    .link-text {
      font-size: 12px;
      color: #11998e;
      word-break: break-all;
      background-color: #ffffff;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
      line-height: 1.6;
    }
    .security-info {
      background-color: #f8f9fa;
      border-left: 4px solid #11998e;
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
    .features-box {
      background-color: #e8f5e9;
      border: 1px solid #4caf50;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .features-box h3 {
      font-size: 16px;
      color: #2e7d32;
      margin-bottom: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
    }
    .feature-item {
      display: flex;
      align-items: start;
      margin-bottom: 10px;
    }
    .feature-icon {
      font-size: 16px;
      margin-right: 10px;
      margin-top: 2px;
    }
    .feature-text {
      font-size: 14px;
      color: #2e7d32;
      line-height: 1.6;
    }
    .warning-box {
      background-color: #fee;
      border: 1px solid #fcc;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .warning-box h3 {
      font-size: 16px;
      color: #c33;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
    }
    .warning-box p {
      font-size: 14px;
      color: #c33;
      margin: 5px 0;
      line-height: 1.6;
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
      color: #11998e;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
      .magic-icon {
        font-size: 48px;
      }
      .magic-button {
        padding: 16px 35px;
        font-size: 15px;
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
      <div class="magic-icon">✨</div>
      <h1>Your Magic Login Link</h1>
      <p>Passwordless authentication • Fast & Secure</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hello${userName ? ` ${userName}` : ''}!</p>
      
      <p class="message">
        You requested a magic link to sign in to your account. Click the button below to instantly and securely log in—no password needed!
      </p>

      <!-- Email Display -->
      <div class="highlight-box">
        <p>Signing in as:</p>
        <div class="email-display">${userEmail}</div>
      </div>

      <!-- Magic Link Button -->
      <div class="button-container">
        <a href="${magicLink}" class="magic-button">🪄 Sign In Instantly</a>
      </div>

      <!-- Timer Box -->
      <div class="timer-box">
        <div class="timer-icon">⏰</div>
        <p><strong>This link expires in ${expiresIn}</strong> and can only be used once</p>
      </div>

      <!-- Security Features -->
      <div class="features-box">
        <h3>✅ Why Magic Links are Secure</h3>
        
        <div class="feature-item">
          <div class="feature-icon">🔒</div>
          <div class="feature-text">
            <strong>No passwords to remember or steal</strong> - reduces phishing risks
          </div>
        </div>
        
        <div class="feature-item">
          <div class="feature-icon">⏱️</div>
          <div class="feature-text">
            <strong>Time-limited access</strong> - link expires after ${expiresIn}
          </div>
        </div>
        
        <div class="feature-item">
          <div class="feature-icon">🎯</div>
          <div class="feature-text">
            <strong>One-time use only</strong> - link becomes invalid after first use
          </div>
        </div>
        
        <div class="feature-item">
          <div class="feature-icon">📧</div>
          <div class="feature-text">
            <strong>Email verification</strong> - confirms you have access to this email
          </div>
        </div>
      </div>

      <!-- Alternative Link -->
      <div class="alternative-link">
        <p><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
        <div class="link-text">${magicLink}</div>
      </div>

      ${(ipAddress || location || device) ? `
      <!-- Security Information -->
      <div class="security-info">
        <h3>Login Request Details</h3>
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
          <span class="info-label">Requested:</span>
          <span class="info-value">${new Date().toLocaleString()}</span>
        </div>
      </div>
      ` : ''}

      <!-- Warning Box -->
      <div class="warning-box">
        <h3>⚠️ Didn't request this link?</h3>
        <p>If you didn't try to sign in, you can safely ignore this email. The link will expire automatically.</p>
        <p style="margin-top: 10px;">However, if you're concerned about your account security, please <a href="#" style="color: #c33; text-decoration: underline;">change your password</a> immediately.</p>
      </div>

      <p class="message" style="margin-top: 30px; font-size: 14px; text-align: center;">
        <strong>Important:</strong> Never share this email or link with anyone. Our team will never ask you for this link.
      </p>

      <p class="message" style="margin-top: 20px; font-size: 14px; text-align: center;">
        Need help? <a href="#" style="color: #11998e;">Contact our support team</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>This is an automated message from Your App Name</p>
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