export interface WelcomeEmailParams {
  userName: string;
  verificationLink: string;
  expiresIn: string; // e.g., "24 hours"
}

export const welcomeEmailTemplate = (params: WelcomeEmailParams): string => {
  const { userName, verificationLink, expiresIn } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our Platform</title>
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
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .verify-button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s;
    }
    .verify-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .alternative-link {
      margin-top: 25px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .alternative-link p {
      font-size: 14px;
      color: #666666;
      margin-bottom: 10px;
    }
    .link-text {
      font-size: 13px;
      color: #667eea;
      word-break: break-all;
      background-color: #ffffff;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
    }
    .info-box {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 15px;
      margin: 25px 0;
    }
    .info-box p {
      font-size: 14px;
      color: #856404;
      margin: 0;
    }
    .features {
      margin: 30px 0;
    }
    .feature-item {
      display: flex;
      align-items: start;
      margin-bottom: 15px;
    }
    .feature-icon {
      width: 24px;
      height: 24px;
      background-color: #667eea;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
      color: #ffffff;
      font-size: 14px;
      font-weight: bold;
    }
    .feature-text {
      font-size: 14px;
      color: #666666;
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
      color: #667eea;
      text-decoration: none;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #999999;
      text-decoration: none;
      font-size: 13px;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
      .greeting {
        font-size: 18px;
      }
      .verify-button {
        padding: 14px 30px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>🎉 Welcome to Our Platform!</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hello ${userName},</p>
      
      <p class="message">
        Thank you for signing up! We're excited to have you on board. To get started, please verify your email address by clicking the button below.
      </p>

      <!-- Verify Button -->
      <div class="button-container">
        <a href="${verificationLink}" class="verify-button">Verify Email Address</a>
      </div>

      <!-- Expiration Warning -->
      <div class="info-box">
        <p>⏰ This verification link will expire in ${expiresIn}. Please verify your email as soon as possible.</p>
      </div>

      <!-- Alternative Link -->
      <div class="alternative-link">
        <p><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
        <div class="link-text">${verificationLink}</div>
      </div>

      <!-- Features Section -->
      <div class="features">
        <p style="font-size: 16px; font-weight: 600; color: #333333; margin-bottom: 15px;">What's next?</p>
        
        <div class="feature-item">
          <div class="feature-icon">1</div>
          <div class="feature-text">
            <strong>Verify your email</strong> to activate your account
          </div>
        </div>
        
        <div class="feature-item">
          <div class="feature-icon">2</div>
          <div class="feature-text">
            <strong>Create your first team</strong> and start collaborating
          </div>
        </div>
        
        <div class="feature-item">
          <div class="feature-icon">3</div>
          <div class="feature-text">
            <strong>Enable two-factor authentication</strong> for enhanced security
          </div>
        </div>
        
        <div class="feature-item">
          <div class="feature-icon">4</div>
          <div class="feature-text">
            <strong>Explore features</strong> and build amazing projects
          </div>
        </div>
      </div>

      <p class="message" style="margin-top: 30px; font-size: 14px;">
        If you didn't create an account, please ignore this email or <a href="#" style="color: #667eea;">contact our support team</a>.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>© ${new Date().getFullYear()} Your App Name. All rights reserved.</p>
      <p>
        <a href="#">Privacy Policy</a> • 
        <a href="#">Terms of Service</a> • 
        <a href="#">Contact Support</a>
      </p>
      <div class="social-links">
        <a href="#">Twitter</a>
        <a href="#">LinkedIn</a>
        <a href="#">GitHub</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};