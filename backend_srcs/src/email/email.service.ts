import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailService.name);

    constructor(private readonly configService: ConfigService) {
        this.initializeTransporter();
    }

    private initializeTransporter() {
        const host = this.configService.get<string>('SMTP_HOST');
        const port = this.configService.get<number>('SMTP_PORT');
        const user = this.configService.get<string>('SMTP_USER');
        const pass = this.configService.get<string>('SMTP_PASS');
        const secure = this.configService.get<boolean>('SMTP_SECURE', false);

        if (!host || !port) {
            this.logger.warn('SMTP not configured - emails disabled');
            this.transporter = nodemailer.createTransport({
                streamTransport: true,
                newline: 'unix',
                buffer: true,
            });
            return;
        }

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: user && pass ? { user, pass } : undefined,
            tls: { rejectUnauthorized: false },
        });

        this.logger.log(`SMTP: ${host}:${port}`);
    }

    async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: this.configService.get<string>('SMTP_FROM', '"NetPong Support" <noreply@netpong.com>'),
            to: email,
            subject: 'Password Reset Request - NetPong',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="padding: 40px 20px;">
                                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <!-- Header -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">NetPong</h1>
                                        </td>
                                    </tr>
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Password Reset Request</h2>
                                            <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                We received a request to reset your password for your NetPong account. Click the button below to create a new password:
                                            </p>
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td style="padding: 20px 0;">
                                                        <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">Reset Password</a>
                                                    </td>
                                                </tr>
                                            </table>
                                            <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                                If the button doesn't work, copy and paste this link into your browser:
                                            </p>
                                            <p style="margin: 0 0 20px 0; word-break: break-all;">
                                                <a href="${resetUrl}" style="color: #667eea; text-decoration: none; font-size: 14px;">${resetUrl}</a>
                                            </p>
                                            <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #eeeeee;">
                                                <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                                    <strong>Security Notice:</strong>
                                                </p>
                                                <ul style="margin: 0; padding-left: 20px; color: #999999; font-size: 14px; line-height: 1.6;">
                                                    <li>This link will expire in 1 hour</li>
                                                    <li>If you didn't request this reset, please ignore this email</li>
                                                    <li>Your password will remain unchanged</li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #f8f8f8; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
                                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                                © ${new Date().getFullYear()} NetPong. All rights reserved.
                                            </p>
                                            <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px;">
                                                You received this email because a password reset was requested for your account.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
            text: `
Password Reset Request

We received a request to reset your password for your NetPong account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this reset, please ignore this email. Your password will remain unchanged.

© ${new Date().getFullYear()} NetPong. All rights reserved.
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            
            if (this.transporter.options['streamTransport']) {
                this.logger.log(`DEV MODE - Reset URL: ${resetUrl}`);
            } else {
                this.logger.log(`Email sent to ${email}`);
            }
        } catch (error) {
            this.logger.error(`Email failed for ${email}:`, error.message);
            throw new Error('Failed to send email');
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            return true;
        } catch (error) {
            this.logger.error('SMTP failed:', error.message);
            return false;
        }
    }
}
