import nodemailer from 'nodemailer';

/**
 * In-memory storage for test/mock mail delivery inspections
 */
export const mockMailInbox = [];

/**
 * Reset in-memory mock mailbox (for test suite isolation)
 */
export const clearMockMailInbox = () => {
  mockMailInbox.length = 0;
};

/**
 * Escape user-controlled strings for safe HTML email rendering
 */
const escapeHtml = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Creates a configured Nodemailer transporter
 */
const createTransporter = (customTransport = null) => {
  if (customTransport) {
    return customTransport;
  }

  // Automated test mode: use in-memory stream mock transporter
  if (process.env.NODE_ENV === 'test') {
    return {
      sendMail: async (options) => {
        mockMailInbox.push(options);
        return {
          messageId: `mock-test-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          response: '250 OK mock delivered',
        };
      },
    };
  }

  // Check if live SMTP credentials are provided in environment
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
  }

  // Development Fallback: Safe mock transporter that records and warns
  return {
    sendMail: async (options) => {
      mockMailInbox.push(options);
      console.log('------------------------------------------------------------');
      console.log(' [EMAIL SERVICE - DEV MOCK TRANSPORT]');
      console.log(` To: ${options.to}`);
      console.log(` Subject: ${options.subject}`);
      console.log(' Notice: SMTP credentials not set in .env. Email recorded to mockMailInbox.');
      console.log('------------------------------------------------------------');
      return {
        messageId: `mock-dev-${Date.now()}`,
        response: '250 OK (development mock fallback)',
      };
    },
  };
};

/**
 * Send Institutional Registration OTP Email
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient institutional email address
 * @param {string} params.name - Recipient student name
 * @param {string} params.otp - 6-digit numeric OTP
 * @param {number} [params.expiryMinutes=10] - Validity window in minutes
 * @param {Object} [params.customTransport=null] - Optional injected transport for testing
 */
export const sendRegistrationOtpEmail = async ({
  to,
  name,
  otp,
  expiryMinutes = 10,
  customTransport = null,
}) => {
  if (!to || !otp) {
    throw new Error('Recipient email and OTP are required to send registration email.');
  }

  const safeName = escapeHtml(name || 'COEP Student');
  const safeOtp = escapeHtml(String(otp).trim());
  const fromAddress =
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    '"CampusFix Verification" <noreply@coeptech.ac.in>';

  const subject = `[CampusFix] Your Registration Verification Code: ${safeOtp}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CampusFix Verification Code</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0284c7; padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.025em; }
    .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px; }
    .otp-box { background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0369a1; display: inline-block; }
    .otp-expiry { font-size: 12px; color: #64748b; margin-top: 8px; font-weight: 500; }
    .warning { background: #fff7ed; border-left: 4px solid #f97316; padding: 12px 14px; border-radius: 4px; font-size: 12px; color: #9a3412; margin: 24px 0 0; line-height: 1.5; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; text-align: center; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>CampusFix · COEP Technological University</h1>
      <p>Institutional Account Verification</p>
    </div>
    <div class="content">
      <div class="greeting">Hello ${safeName},</div>
      <p class="text">
        Thank you for creating your account on <strong>CampusFix</strong>, the official campus maintenance and issue reporting portal.
      </p>
      <p class="text">
        Use the following one-time verification code to verify your institutional email address and complete registration:
      </p>
      
      <div class="otp-box">
        <div class="otp-code">${safeOtp}</div>
        <div class="otp-expiry">Valid for ${expiryMinutes} minutes · Single use only</div>
      </div>

      <div class="warning">
        <strong>Security Notice:</strong> Never share this code with anyone. CampusFix administrators and facility staff will never ask for your verification code or password.
      </div>
    </div>
    <div class="footer">
      This is an automated message sent to ${escapeHtml(to)}.<br>
      COEP Technological University, Shivajinagar, Pune 411005.
    </div>
  </div>
</body>
</html>
`;

  const textContent = `
CampusFix — Institutional Email Verification

Hello ${safeName},

Your one-time registration verification code is: ${safeOtp}

This code is valid for ${expiryMinutes} minutes. It is strictly for single use.

SECURITY NOTICE: Do not share this code with anyone. CampusFix staff will never ask for your verification code.

COEP Technological University · CampusFix
`.trim();

  const transporter = createTransporter(customTransport);

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService Error] Failed to deliver OTP email to ${to}:`, error.message);
    throw new Error('Failed to send verification email. Please check your address and try again.');
  }
};

export default {
  sendRegistrationOtpEmail,
  mockMailInbox,
  clearMockMailInbox,
};
