export const generateOtpEmailTemplate = (otp: string, userName: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - ChatApp</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
            }
            .title {
                font-size: 24px;
                color: #1f2937;
                margin-bottom: 20px;
            }
            .otp-container {
                background-color: #f8fafc;
                border: 2px dashed #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
            }
            .otp-code {
                font-size: 32px;
                font-weight: bold;
                color: #2563eb;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
                background-color: #ffffff;
                padding: 15px 20px;
                border-radius: 6px;
                display: inline-block;
                border: 1px solid #e5e7eb;
            }
            .message {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 20px;
            }
            .warning {
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .warning-text {
                color: #92400e;
                font-size: 14px;
                margin: 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #9ca3af;
                font-size: 14px;
            }
            .expiry {
                color: #ef4444;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">💬 ChatApp</div>
                <h1 class="title">Email Verification</h1>
            </div>
            
            <p class="message">Hello ${userName},</p>
            <p class="message">Thank you for registering with ChatApp! To complete your registration and verify your email address, please use the following One-Time Password (OTP):</p>
            
            <div class="otp-container">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your verification code:</p>
                <div class="otp-code">${otp}</div>
            </div>
            
            <div class="warning">
                <p class="warning-text">
                    <strong>Important:</strong> This OTP will expire in 10 minutes and can only be used once. 
                    Do not share this code with anyone. If you didn't request this verification, please ignore this email.
                </p>
            </div>
            
            <p class="message">
                Enter this code in the verification form to activate your account. 
                If you have any issues, please contact our support team.
            </p>
            
            <div class="footer">
                <p>This email was sent by ChatApp</p>
                <p>If you didn't create an account, please ignore this email.</p>
                <p class="expiry">⏰ Code expires in 10 minutes</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
