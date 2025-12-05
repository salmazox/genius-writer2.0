const nodemailer = require('nodemailer');

/**
 * Email Service for sending transactional emails
 * Supports multiple email providers via SMTP
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initialize();
  }

  /**
   * Initialize email transporter with environment variables
   */
  initialize() {
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      SMTP_FROM_EMAIL,
      SMTP_FROM_NAME,
      FRONTEND_URL
    } = process.env;

    // Check if SMTP is configured
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.warn('[EMAIL] SMTP not configured. Password reset emails will be logged to console only.');
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT) || 587,
        secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      this.fromEmail = SMTP_FROM_EMAIL || SMTP_USER;
      this.fromName = SMTP_FROM_NAME || 'Genius Writer';
      this.frontendUrl = FRONTEND_URL || 'https://genius-writer.vercel.app';
      this.isConfigured = true;

      console.log('[EMAIL] Email service configured successfully');
    } catch (error) {
      console.error('[EMAIL] Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Send password reset email
   * @param {string} email - Recipient email address
   * @param {string} resetToken - Password reset token
   * @param {string} name - User's name
   */
  async sendPasswordResetEmail(email, resetToken, name) {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: email,
      subject: 'Reset Your Password - Genius Writer',
      html: this.getPasswordResetTemplate(name, resetUrl),
      text: this.getPasswordResetTextVersion(name, resetUrl),
    };

    return await this.sendEmail(mailOptions);
  }

  /**
   * Send subscription confirmation email
   * @param {string} email - Recipient email address
   * @param {string} name - User's name
   * @param {string} plan - Subscription plan
   * @param {string} billingPeriod - monthly or yearly
   */
  async sendSubscriptionConfirmation(email, name, plan, billingPeriod) {
    const mailOptions = {
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: email,
      subject: `Welcome to ${plan} Plan - Genius Writer`,
      html: this.getSubscriptionConfirmationTemplate(name, plan, billingPeriod),
      text: `Hi ${name},\n\nWelcome to Genius Writer ${plan} plan! Your subscription is now active.\n\nThank you for choosing Genius Writer.`
    };

    return await this.sendEmail(mailOptions);
  }

  /**
   * Send subscription cancelled email
   */
  async sendSubscriptionCancelled(email, name, plan, endDate) {
    const mailOptions = {
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: email,
      subject: 'Your Subscription Has Been Cancelled - Genius Writer',
      html: this.getSubscriptionCancelledTemplate(name, plan, endDate),
      text: `Hi ${name},\n\nYour ${plan} subscription has been cancelled. You'll have access until ${endDate}.\n\nYou can reactivate anytime before this date.`
    };

    return await this.sendEmail(mailOptions);
  }

  /**
   * Send payment failed email
   */
  async sendPaymentFailed(email, name, plan, retryDate) {
    const mailOptions = {
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: email,
      subject: 'Payment Failed - Update Payment Method',
      html: this.getPaymentFailedTemplate(name, plan, retryDate),
      text: `Hi ${name},\n\nWe couldn't process your payment for ${plan} plan. Please update your payment method to avoid service interruption.\n\nNext retry: ${retryDate}`
    };

    return await this.sendEmail(mailOptions);
  }

  /**
   * Send usage limit warning
   */
  async sendUsageLimitWarning(email, name, limitType, percentage, current, limit) {
    const mailOptions = {
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: email,
      subject: `You've Used ${percentage}% of Your ${limitType}`,
      html: this.getUsageLimitWarningTemplate(name, limitType, percentage, current, limit),
      text: `Hi ${name},\n\nYou've used ${current}/${limit} of your ${limitType} (${percentage}%).\n\nConsider upgrading to avoid hitting your limit.`
    };

    return await this.sendEmail(mailOptions);
  }

  /**
   * Generic send email method
   */
  async sendEmail(mailOptions) {
    try {
      if (this.isConfigured && this.transporter) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('[EMAIL] Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
      } else {
        // Development mode - log to console
        console.log('[EMAIL] Development mode - Email:');
        console.log('='.repeat(80));
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log('='.repeat(80));
        return { success: true, dev: true };
      }
    } catch (error) {
      console.error('[EMAIL] Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * HTML template for password reset email
   */
  getPasswordResetTemplate(name, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Genius Writer</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">Reset Your Password</h2>
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Hi ${name},
                    </p>
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      We received a request to reset your password for your Genius Writer account. Click the button below to create a new password:
                    </p>

                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 30px 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      This link will expire in <strong>1 hour</strong> for security reasons.
                    </p>

                    <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                    </p>

                    <!-- Alternative Link -->
                    <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #667eea;">
                      <p style="margin: 0 0 10px; color: #4b5563; font-size: 14px; font-weight: 600;">
                        Button not working?
                      </p>
                      <p style="margin: 0; color: #6b7280; font-size: 13px; word-break: break-all;">
                        Copy and paste this link into your browser:<br>
                        <a href="${resetUrl}" style="color: #667eea; text-decoration: underline;">${resetUrl}</a>
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                      © ${new Date().getFullYear()} Genius Writer. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      You're receiving this email because you requested a password reset.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Plain text version for email clients that don't support HTML
   */
  getPasswordResetTextVersion(name, resetUrl) {
    return `
Hi ${name},

We received a request to reset your password for your Genius Writer account.

To reset your password, click the link below or copy and paste it into your browser:

${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

Best regards,
The Genius Writer Team

© ${new Date().getFullYear()} Genius Writer. All rights reserved.
    `.trim();
  }

  /**
   * HTML template for subscription confirmation
   */
  getSubscriptionConfirmationTemplate(name, plan, billingPeriod) {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to ${plan}!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Your subscription to Genius Writer <strong>${plan}</strong> plan is now active!</p>
              <p style="font-size: 16px; margin-bottom: 20px;">You now have access to all premium features. Billing cycle: <strong>${billingPeriod}</strong></p>
              <a href="${this.frontendUrl}/dashboard" style="display: inline-block; background: #4f46e5; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Go to Dashboard</a>
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">Thank you for choosing Genius Writer!</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * HTML template for subscription cancelled
   */
  getSubscriptionCancelledTemplate(name, plan, endDate) {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Your <strong>${plan}</strong> subscription has been cancelled.</p>
              <p style="font-size: 16px; margin-bottom: 20px;">You'll have access to all premium features until <strong>${endDate}</strong>.</p>
              <p style="font-size: 16px; margin-bottom: 20px;">You can reactivate your subscription anytime before this date.</p>
              <a href="${this.frontendUrl}/dashboard/billing" style="display: inline-block; background: #10b981; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reactivate Subscription</a>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * HTML template for payment failed
   */
  getPaymentFailedTemplate(name, plan, retryDate) {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
          <tr>
            <td style="background: #fef3c7; padding: 40px 30px; border-radius: 8px 8px 0 0;">
              <h1 style="color: #92400e; margin: 0; font-size: 24px;">Payment Failed</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">We couldn't process your payment for your <strong>${plan}</strong> subscription.</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Please update your payment method to avoid service interruption.</p>
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">Next payment retry: ${retryDate}</p>
              <a href="${this.frontendUrl}/dashboard/billing" style="display: inline-block; background: #ef4444; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Update Payment Method</a>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * HTML template for usage limit warning
   */
  getUsageLimitWarningTemplate(name, limitType, percentage, current, limit) {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">You've used <strong>${current}/${limit}</strong> of your ${limitType} (${percentage}%).</p>
              <div style="background: #f3f4f6; border-radius: 999px; height: 8px; margin: 20px 0;">
                <div style="background: ${percentage >= 90 ? '#ef4444' : '#f59e0b'}; width: ${Math.min(percentage, 100)}%; height: 8px; border-radius: 999px;"></div>
              </div>
              <p style="font-size: 16px; margin-bottom: 20px;">Upgrade your plan to continue without interruption.</p>
              <a href="${this.frontendUrl}/dashboard/billing" style="display: inline-block; background: #4f46e5; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0;">View Upgrade Options</a>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Verify email transporter configuration
   */
  async verifyConnection() {
    if (!this.isConfigured || !this.transporter) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service is ready' };
    } catch (error) {
      console.error('[EMAIL] Connection verification failed:', error);
      return { success: false, message: error.message };
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
