interface OAuthLinkEmailParams {
  userName: string;
  provider: "Google" | "GitHub";
  providerEmail?: string;
  ipAddress?: string;
  location?: string;
  device?: string;
  wasLinked: boolean; // true if account was linked, false if it was a new login
}

export const oauthLinkTemplate = (params: OAuthLinkEmailParams): string => {
  const { userName, provider, providerEmail, ipAddress, location, device, wasLinked } = params;

  const providerColors = {
    Google: "#4285F4",
    GitHub: "#24292e",
  };

  const providerIcons = {
    Google: "🔵",
    GitHub: "⚫",
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${provider} Account ${wasLinked ? 'Linked' : 'Login'}</title>
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
      background: linear-gradient(135deg, ${providerColors[provider]} 0%, ${providerColors[provider]}dd 100%);
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
    .provider-badge {
      background: linear-gradient(135deg, ${providerColors[provider]}22 0%, ${providerColors[provider]}11 100%);
      border: 2px solid ${providerColors[provider]};
      border-radius: 12px;
      padding: 25px;
      text-align: center;
      margin: 30px 0;
    }
    .provider-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .provider-name {
      font-size: 24px;
      font-weight: 700;
      color: ${providerColors[provider]};
      margin-bottom: 10px;
    }
    .provider-email {
      font-size: 14px;
      color: #666666;
      background-color: #ffffff;
      padding: 10px 15px;
      border-radius: 6px;
      display: inline-block;
      margin-top: 10px;
    }
    .action-status {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      text-align: center;
    }
    .action-status h3 {
      font-size: 18px;
      color: #155724;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .action-status p {
      font-size: 14px;
      color: #155724;
      margin: 5px 0;
    }
    .security-info {
      background-color: #f8f9fa;
      border-left: 4px solid ${providerColors[provider]};
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
      background-color: #f0f8ff;
      border: 1px solid ${providerColors[provider]}44;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .features-box h3 {
      font-size: 16px;
      color: #333333;
      margin-bottom: 15px;
      font-weight: 600;
    }
    .feature-item {
      display: flex;
      align-items: start;
      margin-bottom: 12px;
    }
    .feature-icon {
      font-size: 18px;
      margin-right: 10px;
    }
    .feature-text {
      font-size: 14px;
      color: #666666;
      line-height: 1.6;
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
    .action-buttons {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 30px;
      margin: 0 10px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      transition: transform 0.2s;
    }
    .button-primary {
      background: ${providerColors[provider]};
      color: #ffffff !important;
    }
    .button-secondary {
      background: #6c757d;
      color: #ffffff !important;
    }
    .button:hover {
      transform: translateY(-2px);
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
      color: ${providerColors[provider]};
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .provider-name {
        font-size: 20px;
      }
      .button {
        display: block;
        margin: 10px 0;
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
      <h1>${providerIcons[provider]} ${provider} Account ${wasLinked ? 'Linked' : 'Login'}</h1>
      <p>Account security notification</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hello ${userName},</p>
      
      <p class="message">
        ${wasLinked 
          ? `Your ${provider} account has been successfully linked to your account.`
          : `You recently signed in to your account using ${provider}.`
        }
      </p>

      <!-- Provider Badge -->
      <div class="provider-badge">
        <div class="provider-icon">${providerIcons[provider]}</div>
        <div class="provider-name">${provider}</div>
        <p style="color: #666666; font-size: 14px; margin-top: 10px;">
          ${wasLinked ? 'Account Successfully Linked' : 'Login Method Used'}
        </p>
        ${providerEmail ? `<div class="provider-email">${providerEmail}</div>` : ''}
      </div>

      <!-- Action Status -->
      <div class="action-status">
        <h3>✅ ${wasLinked ? 'Account Linked Successfully' : 'Login Successful'}</h3>
        <p>${wasLinked 
          ? `You can now use your ${provider} account to sign in quickly and securely.`
          : `You have successfully signed in using your ${provider} account.`
        }</p>
      </div>

      <!-- Security Information -->
      <div class="security-info">
        <h3>${wasLinked ? 'Link' : 'Login'} Details</h3>
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

      ${wasLinked ? `
      <!-- Features Box -->
      <div class="features-box">
        <h3>What you can do now:</h3>
        
        <div class="feature-item">
          <div class="feature-icon">🚀</div>
          <div class="feature-text">
            <strong>Quick Sign-In:</strong> Use ${provider} for faster authentication
          </div>
        </div>
        
        <div class="feature-item">
          <div class="feature-icon">🔒</div>
          <div class="feature-text">
            <strong>Enhanced Security:</strong> Leverage ${provider}'s secure authentication
          </div>
        </div>
        
        <div class="feature-item">
          <div class="feature-icon">🔗</div>
          <div class="feature-text">
            <strong>Manage Connections:</strong> Unlink anytime from account settings
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Warning Box -->
      <div class="warning-box">
        <h3>⚠️ Didn't ${wasLinked ? 'link this account' : 'sign in'}?</h3>
        <p>If you didn't ${wasLinked ? 'authorize this connection' : 'perform this login'}, your account may be compromised. Please secure your account immediately by changing your password and reviewing your account activity.</p>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <a href="#" class="button button-primary">View Account Settings</a>
        <a href="#" class="button button-secondary">Report Suspicious Activity</a>
      </div>

      <p class="message" style="margin-top: 30px; font-size: 14px; text-align: center;">
        Need help? <a href="#" style="color: ${providerColors[provider]};">Contact our support team</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>This is an automated security notification from Your App Name</p>
      <p>© ${new Date().getFullYear()} Your App Name. All rights reserved.</p>
      <p>
        <a href="#">Privacy Policy</a> • 
        <a href="#">Security Center</a> • 
        <a href="#">Manage Connected Accounts</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
};