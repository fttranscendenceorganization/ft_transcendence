import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(private readonly configService: ConfigService) {
    }

    async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        const fromConfig = this.configService.get<string>('RESEND_FROM');
        const from = fromConfig && fromConfig.includes('@')
            ? fromConfig
            : '"NetPong Support" <no-reply@netpong.games>';

        const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
        const mailOptions = {
            from,
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
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">NetPong</h1>
                                        </td>
                                    </tr>
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
                                                If you didn't request this reset, you can safely ignore this email.
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

Use the button in the email to reset your password. This link expires in 1 hour.

If you didn't request this reset, please ignore this email. Your password will remain unchanged.

© ${new Date().getFullYear()} NetPong. All rights reserved.
            `,
        };

        if (!resendApiKey) {
            this.logger.error('RESEND_API_KEY is not configured');
            return;
        }

        try {
            await this.sendWithResend(resendApiKey, from, email, mailOptions.subject, mailOptions.html, mailOptions.text);
        } catch (error) {
            this.logger.error(`Resend failed for ${email}:`, error.message);
        }
    }

    private async sendWithResend(
        apiKey: string,
        from: string,
        to: string,
        subject: string,
        html: string,
        text: string,
    ): Promise<void> {
        try {
            const payload: Record<string, unknown> = {
                from,
                to,
                subject,
                html,
                text,
            };

            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                this.logger.error(`Resend error (${response.status}): ${errorBody}`);
                throw new Error('Failed to send email');
            }

            this.logger.log(`Email sent via Resend to ${to}`);
        } catch (error) {
            this.logger.error(`Resend failed for ${to}:`, error.message);
            throw new Error('Failed to send email');
        }
    }
}
