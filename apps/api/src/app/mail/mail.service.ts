import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter!: Transporter;

  constructor(private readonly configService: ConfigService) {
    const host =
      this.configService.get<string>('mail.host') || 'smtp-relay.brevo.com';
    const port = this.configService.get<number>('mail.port') || 587;
    const user = this.configService.get<string>('mail.user') || '';
    const pass = this.configService.get<string>('mail.apiKey') || '';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false, // TLS via STARTTLS on 587
      auth: {
        user,
        pass,
      },
    });
  }

  async sendOtpEmail(
    email: string,
    otp: string,
    purpose: 'register' | 'forgot_password',
  ): Promise<boolean> {
    const actionText =
      purpose === 'register' ? 'Account Registration' : 'Password Reset';
    const title = purpose === 'register' ? 'Verify Your Email' : 'Reset Your Password';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #334155; }
            .logo { font-size: 24px; font-weight: bold; color: #38bdf8; text-align: center; margin-bottom: 24px; }
            h2 { color: #f1f5f9; font-size: 20px; text-align: center; margin-bottom: 8px; }
            p { color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 24px; }
            .otp-box { background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%); border-radius: 8px; padding: 16px; text-align: center; letter-spacing: 8px; font-size: 32px; font-weight: bold; color: #ffffff; margin: 24px 0; }
            .footer { font-size: 12px; color: #64748b; text-align: center; margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">💬 ChatApp</div>
            <h2>${title}</h2>
            <p>You requested an OTP for <strong>${actionText}</strong>. Use the 6-digit code below to proceed. This code expires in 10 minutes.</p>
            <div class="otp-box">${otp}</div>
            <p>If you did not request this email, please ignore it.</p>
            <div class="footer">
              &copy; ${new Date().getFullYear()} ChatApp. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: '"ChatApp Security" <no-reply@chatapp.com>',
        to: email,
        subject: `${otp} is your ChatApp verification code for ${actionText}`,
        html: htmlContent,
      });

      this.logger.log(`OTP email sent successfully to ${email} (MessageId: ${info.messageId})`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      return false;
    }
  }
}
